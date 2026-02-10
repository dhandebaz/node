import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function GET() {
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("integrations")
    .select("tenant_id, status, connected_name, last_synced_at")
    .eq("tenant_id", tenantId)
    .eq("provider", "instagram")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({
      status: "disconnected",
      connectedName: null,
      lastSyncedAt: null,
    });
  }

  return NextResponse.json({
    status: data.status || "connected",
    connectedName: data.connected_name,
    lastSyncedAt: data.last_synced_at,
  });
}
