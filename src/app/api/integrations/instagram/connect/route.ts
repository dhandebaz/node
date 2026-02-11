import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getPersonaCapabilities } from "@/lib/business-context";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

export async function POST() {
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  // 1. Check Capabilities
  const { data: tenant } = await supabase
    .from("tenants")
    .select("business_type")
    .eq("id", tenantId)
    .single();

  const capabilities = getPersonaCapabilities(tenant?.business_type);
  if (!capabilities.integrations.instagram) {
    await logEvent({
        tenant_id: tenantId,
        actor_type: 'user',
        actor_id: session.userId,
        event_type: EVENT_TYPES.ACTION_BLOCKED,
        entity_type: 'integration',
        entity_id: 'instagram',
        metadata: { reason: "Persona capability restriction" }
    });
    return NextResponse.json({ error: "Instagram integration is not enabled for your business type" }, { status: 403 });
  }

  // 2. Mock Connection
  const { error } = await supabase
    .from("integrations")
    .upsert({
      tenant_id: tenantId,
      user_id: session.userId,
      provider: "instagram",
      status: "connected",
      connected_name: "Instagram Account",
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: "tenant_id, provider" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: "connected" });
}
