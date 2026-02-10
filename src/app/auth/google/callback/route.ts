import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/crypto";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { logEvent, EVENT_TYPES } from "@/lib/events";

const getBaseUrl = (request: Request) => {
  const headers = request.headers;
  const protocol = headers.get("x-forwarded-proto") || "http";
  const host = headers.get("x-forwarded-host") || headers.get("host");
  return `${protocol}://${host}`;
};

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Resolve active tenant
  let tenantId: string | null = null;
  try {
    tenantId = await requireActiveTenant();
  } catch (error) {
    console.error("Failed to resolve tenant in Google callback:", error);
    // Continue without tenantId? 
    // If tenantId is required for integrations table (which it is for multi-tenancy), this will fail.
    // We should probably redirect to error if tenant resolution fails.
    return NextResponse.redirect(new URL("/dashboard/integrations?google=tenant_error", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  if (errorParam) {
    return NextResponse.redirect(new URL("/dashboard/integrations?google=error", request.url));
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/dashboard/integrations?google=state_mismatch", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/dashboard/integrations?google=missing_config", request.url));
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${getBaseUrl(request)}/auth/google/callback`;
  const tokenBody = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code"
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenBody
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/dashboard/integrations?google=token_error", request.url));
  }

  const tokenPayload = await tokenResponse.json();
  const accessToken = tokenPayload.access_token as string;
  const refreshToken = tokenPayload.refresh_token as string | undefined;
  const expiresIn = Number(tokenPayload.expires_in || 0);
  const scope = tokenPayload.scope as string | undefined;

  const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const userInfo = userInfoResponse.ok ? await userInfoResponse.json() : {};

  const connectedEmail = userInfo.email || null;
  const connectedName = userInfo.name || null;
  const scopes = scope ? scope.split(" ") : [];
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

  const supabase = await getSupabaseServer();
  const { data: integration, error: upsertError } = await supabase
    .from("integrations")
    .upsert(
      {
        user_id: session.userId,
        tenant_id: tenantId,
        provider: "google",
        status: "connected",
        access_token: encryptToken(accessToken),
        refresh_token: refreshToken ? encryptToken(refreshToken) : null,
        scopes,
        expires_at: expiresAt,
        connected_email: connectedEmail,
        connected_name: connectedName,
        error_code: null,
        last_sync: null,
        last_synced_at: null,
        metadata: { oauth_provider: "google" },
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,provider" }
    )
    .select()
    .single();

  if (upsertError) {
    console.error("Integration upsert error:", upsertError);
    return NextResponse.redirect(new URL("/dashboard/integrations?google=db_error", request.url));
  }

  await supabase.from("google_context").upsert(
    {
      user_id: session.userId,
      has_gmail_access: scopes.includes("https://www.googleapis.com/auth/gmail.readonly"),
      has_calendar_access: scopes.includes("https://www.googleapis.com/auth/calendar"),
      has_business_access: scopes.includes("https://www.googleapis.com/auth/business.manage"),
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id" }
  );

  if (integration) {
    await logEvent({
      tenant_id: tenantId,
      actor_type: "user",
      actor_id: session.userId,
      event_type: EVENT_TYPES.INTEGRATION_CONNECTED,
      entity_type: "integration",
      entity_id: integration.id,
      metadata: { 
        provider: "google",
        connected_email: connectedEmail,
        scopes 
      }
    });
  }

  return NextResponse.redirect(new URL("/dashboard/integrations?google=connected", request.url));
}
