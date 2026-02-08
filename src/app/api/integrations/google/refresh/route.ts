import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { decryptToken, encryptToken } from "@/lib/crypto";

export async function POST() {
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google OAuth is not configured" }, { status: 500 });
  }

  const supabase = await getSupabaseServer();
  const { data: integration, error } = await supabase
    .from("integrations")
    .select("id, refresh_token")
    .eq("user_id", session.userId)
    .eq("provider", "google")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!integration?.refresh_token) {
    return NextResponse.json({ error: "No refresh token available" }, { status: 400 });
  }

  const refreshToken = decryptToken(integration.refresh_token);
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token"
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!tokenResponse.ok) {
    const errorPayload = await tokenResponse.json().catch(() => ({}));
    return NextResponse.json({ error: errorPayload.error || "Failed to refresh token" }, { status: 502 });
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token as string;
  const expiresIn = Number(tokenData.expires_in || 0);
  const scopes = tokenData.scope ? String(tokenData.scope).split(" ") : null;

  const updateData: Record<string, any> = {
    access_token: encryptToken(accessToken),
    expires_at: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
    status: "connected",
    error_code: null,
    updated_at: new Date().toISOString()
  };

  if (scopes) {
    updateData.scopes = scopes;
  }

  const { error: updateError } = await supabase
    .from("integrations")
    .update(updateData)
    .eq("id", integration.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ status: "connected" });
}
