import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/crypto";
import { getSession } from "@/lib/auth/session";
import { getActiveTenantId } from "@/lib/auth/tenant";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value;

  // 1. Validation
  if (error) {
    return NextResponse.redirect(new URL("/dashboard/ai/integrations?error=google_auth_failed", request.url));
  }

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/dashboard/ai/integrations?error=invalid_state", request.url));
  }

  // Clear state cookie
  cookieStore.delete("google_oauth_state");

  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Construct redirect URI to match what was sent in connect
    const headers = request.headers;
    const protocol = headers.get("x-forwarded-proto") || "http";
    const host = headers.get("x-forwarded-host") || headers.get("host");
    const baseUrl = `${protocol}://${host}`;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/integrations/google/callback`;

    // 2. Exchange code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Google Token Error:", tokens);
      throw new Error("Failed to exchange token");
    }

    // 3. Get User Info (email)
    const userResponse = await fetch(GOOGLE_USER_INFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    const userData = await userResponse.json();
    if (!userResponse.ok) {
      throw new Error("Failed to get user info");
    }

    // 4. Store in DB
    const supabase = await getSupabaseServer();
    
    // Get Tenant ID
    let tenantId = await getActiveTenantId();
    if (!tenantId) {
      console.error("Missing tenant ID in callback");
      // Fallback: Try to find tenant from user membership
      const { data: member } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("user_id", session.userId)
        .limit(1)
        .single();
        
      if (!member) {
         throw new Error("No tenant found for user");
      }
      tenantId = member.tenant_id;
    }

    // Encrypt tokens
    const encryptedAccessToken = encryptToken(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null;
    
    // Calculate expiry
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Upsert integration
    const upsertData: any = {
      user_id: session.userId,
      tenant_id: tenantId, // Enforce tenant scoping
      provider: "google",
      status: "connected",
      access_token: encryptedAccessToken,
      scopes: tokens.scope ? tokens.scope.split(" ") : [],
      expires_at: expiresAt,
      connected_email: userData.email,
      connected_name: userData.name,
      last_synced_at: new Date().toISOString(),
      metadata: { picture: userData.picture }
    };

    if (encryptedRefreshToken) {
      upsertData.refresh_token = encryptedRefreshToken;
    }

    const { error: upsertError } = await supabase
      .from("integrations")
      .upsert(upsertData, {
        onConflict: "user_id,provider" // Note: Schema might need unique constraint on tenant_id,provider too, but for now user_id is unique enough per provider
      });

    if (upsertError) {
      console.error("DB Error:", upsertError);
      throw new Error("Database update failed");
    }

    // Update context
    await supabase.from("google_context").upsert({
      user_id: session.userId,
      tenant_id: tenantId,
      has_gmail_access: true,
      has_calendar_access: true,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });

    return NextResponse.redirect(new URL("/dashboard/ai/integrations?status=connected", request.url));

  } catch (err) {
    console.error("Callback Error:", err);
    return NextResponse.redirect(new URL("/dashboard/ai/integrations?error=internal_error", request.url));
  }
}
