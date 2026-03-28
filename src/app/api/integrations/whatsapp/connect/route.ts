import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getPersonaCapabilities } from "@/lib/business-context";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { wahaService } from "@/lib/services/wahaService";
import { getAppUrl } from "@/lib/runtime-config";

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
      actor_type: "user",
      actor_id: session.userId,
      event_type: EVENT_TYPES.ACTION_BLOCKED,
      entity_type: "integration",
      entity_id: "whatsapp",
      metadata: { reason: "Persona capability restriction" },
    });
    return NextResponse.json(
      {
        error: "WhatsApp integration is not enabled for your business type",
      },
      { status: 403 },
    );
  }

  // 2. Resolve the webhook target against the configured deployment URL.
  const appUrl = getAppUrl();

  // 3. Start WAHA session  -  registers webhook and returns QR code URL if not already authenticated
  const webhookUrl = `${appUrl}/api/integrations/webhook/whatsapp?tenantId=${tenantId}`;
  const { status, qrUrl } = await wahaService.startSession({
    sessionName: tenantId,
    webhooks: [{ url: webhookUrl, events: ["message"] }],
  });

  const integrationStatus = status === "WORKING" ? "active" : "pending_qr";

  // 4. Persist integration record
  const { error } = await supabase.from("integrations").upsert(
    {
      tenant_id: tenantId,
      user_id: session.userId,
      provider: "whatsapp",
      status: integrationStatus,
      connected_name: "WhatsApp",
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "tenant_id, provider" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 5. Log event
  await logEvent({
    tenant_id: tenantId,
    actor_type: "user",
    actor_id: session.userId,
    event_type: EVENT_TYPES.INTEGRATION_CONNECTED,
    entity_type: "integration",
    entity_id: "whatsapp",
    metadata: { status: integrationStatus },
  });

  return NextResponse.json({ success: true, status: integrationStatus, qrUrl });
}
