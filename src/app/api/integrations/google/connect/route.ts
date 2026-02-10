import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { getPersonaCapabilities } from "@/lib/business-context";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/business.manage", // Optional but good for future
  "openid",
  "email",
  "profile"
];

const getBaseUrl = (request: Request) => {
  const headers = request.headers;
  const protocol = headers.get("x-forwarded-proto") || "http";
  const host = headers.get("x-forwarded-host") || headers.get("host");
  return `${protocol}://${host}`;
};

export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("business_type")
    .eq("id", tenantId)
    .single();

  const capabilities = getPersonaCapabilities(tenant?.business_type);

  if (!capabilities.integrations.google) {
    await logEvent({
      tenant_id: tenantId,
      actor_type: 'user',
      actor_id: session.userId,
      event_type: EVENT_TYPES.ACTION_BLOCKED,
      entity_type: 'integration',
      entity_id: 'google-connect',
      metadata: { platform: 'google', reason: "Persona capability restriction" }
    });
    return NextResponse.json(
      { error: "Google integration is not enabled for your business type." },
      { status: 403 }
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth is not configured" }, { status: 500 });
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/"
  });

  // Updated callback URL to point to API route
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${getBaseUrl(request)}/api/integrations/google/callback`;
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline", // Crucial for refresh token
    prompt: "consent", // Force consent to ensure we get refresh token
    scope: GOOGLE_SCOPES.join(" "),
    include_granted_scopes: "true",
    state
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.json({ url });
}
