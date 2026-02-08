import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";

const REQUIRED_SCOPES = {
  gmail: "https://www.googleapis.com/auth/gmail.readonly",
  calendar: "https://www.googleapis.com/auth/calendar",
  business: "https://www.googleapis.com/auth/business.manage"
};

export async function GET() {
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("integrations")
    .select("status, scopes, expires_at, error_code, connected_email, connected_name, last_sync, last_synced_at")
    .eq("user_id", session.userId)
    .eq("provider", "google")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({
      status: "disconnected",
      services: { gmail: false, calendar: false, business: false },
      connectedEmail: null,
      connectedName: null,
      lastSyncedAt: null,
      expiresAt: null,
      errorCode: null
    });
  }

  const scopes = Array.isArray(data.scopes) ? data.scopes : [];
  const services = {
    gmail: scopes.includes(REQUIRED_SCOPES.gmail),
    calendar: scopes.includes(REQUIRED_SCOPES.calendar),
    business: scopes.includes(REQUIRED_SCOPES.business)
  };

  const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
  const isExpired = expiresAt ? expiresAt.getTime() <= Date.now() : false;
  const status = isExpired ? "expired" : data.status || "connected";

  return NextResponse.json({
    status,
    services,
    connectedEmail: data.connected_email || null,
    connectedName: data.connected_name || null,
    lastSyncedAt: data.last_synced_at || data.last_sync || null,
    expiresAt: data.expires_at || null,
    errorCode: data.error_code || null
  });
}
