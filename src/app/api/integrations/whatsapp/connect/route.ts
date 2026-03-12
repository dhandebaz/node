import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getPersonaCapabilities } from "@/lib/business-context";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { wahaService } from "@/lib/services/wahaService";

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
  if (!capabilities.integrations.whatsapp) {
    await logEvent({
        tenant_id: tenantId,
        actor_type: 'user',
        actor_id: session.userId,
        event_type: EVENT_TYPES.ACTION_BLOCKED,
        entity_type: 'integration',
        entity_id: 'whatsapp',
        metadata: { reason: "Persona capability restriction" }
    });
    return NextResponse.json({ error: "WhatsApp integration is not enabled for your business type" }, { status: 403 });
  }

  // 2. Mock Connection (In real life, this would be an OAuth flow or QR code scan)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL is not set" }, { status: 500 });
  }

  const webhookUrl = `${appUrl}/api/integrations/webhook/whatsapp?tenantId=${tenantId}`;
  const { status, qrUrl } = await wahaService.startSession({
    sessionName: tenantId,
    webhooks: [{ url: webhookUrl, events: ["message"] }],
  });

  const integrationStatus = status === "WORKING" ? "active" : "pending_qr";

  const { error } = await supabase
    .from("integrations")
    .upsert({
      tenant_id: tenantId,
      user_id: session.userId,
      provider: "whatsapp",
      status: integrationStatus,
      connected_name: "WhatsApp",
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: "tenant_id, provider" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: integrationStatus, qrUrl });
}
