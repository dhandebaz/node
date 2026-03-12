import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { wahaService } from "@/lib/services/wahaService";

export async function GET() {
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  try {
    const waha = await wahaService.getSession({ sessionName: tenantId });
    if (waha.status === "WORKING") {
      await supabase
        .from("integrations")
        .upsert(
          {
            tenant_id: tenantId,
            user_id: session.userId,
            provider: "whatsapp",
            status: "active",
            connected_name: "WhatsApp",
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "tenant_id, provider" }
        );
    }
  } catch {}
  const { data, error } = await supabase
    .from("integrations")
    .select("tenant_id, status, connected_name, last_synced_at")
    .eq("tenant_id", tenantId)
    .eq("provider", "whatsapp")
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
