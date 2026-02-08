import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { decryptToken } from "@/lib/crypto";

const revokeToken = async (token: string) => {
  const params = new URLSearchParams({ token });
  await fetch(`https://oauth2.googleapis.com/revoke?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  }).catch(() => null);
};

export async function POST() {
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getSupabaseServer();
  const { data: integration, error } = await supabase
    .from("integrations")
    .select("id, access_token, refresh_token, last_synced_at, last_sync")
    .eq("user_id", session.userId)
    .eq("provider", "google")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (integration?.access_token) {
    await revokeToken(decryptToken(integration.access_token));
  }
  if (integration?.refresh_token) {
    await revokeToken(decryptToken(integration.refresh_token));
  }

  if (integration?.id) {
    const { error: updateError } = await supabase
      .from("integrations")
      .update({
        status: "disconnected",
        access_token: null,
        refresh_token: null,
        scopes: [],
        expires_at: null,
        error_code: null,
        connected_email: null,
        connected_name: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", integration.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  await supabase.from("google_context").upsert(
    {
      user_id: session.userId,
      has_gmail_access: false,
      has_calendar_access: false,
      has_business_access: false,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id" }
  );

  await supabase.from("admin_audit_logs").insert({
    admin_id: session.userId,
    target_resource: "integration",
    target_id: session.userId,
    action_type: "google_disconnect",
    details: "Disconnected Google account"
  });

  return NextResponse.json({ status: "disconnected" });
}
