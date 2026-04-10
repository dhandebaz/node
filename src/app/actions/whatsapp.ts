"use server";

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";
import { wahaService } from "@/lib/services/wahaService";
import { getAppUrl } from "@/lib/runtime-config";

export async function generateWhatsAppQRAction() {
  const tenantId = await requireActiveTenant();

  try {
    const supabase = await getSupabaseServer();
    const webhookUrl = `${getAppUrl()}/api/integrations/webhook/whatsapp?tenantId=${tenantId}`;
    const { qrUrl, status } = await wahaService.startSession({
      sessionName: tenantId,
      webhooks: [{ url: webhookUrl, events: ["message"] }],
    });

    // Persist QR URL in metadata for recovery
    if (qrUrl) {
      await supabase.from("integrations").upsert(
        {
          tenant_id: tenantId,
          provider: "whatsapp",
          status: "pending_qr",
          metadata: { qr_url: qrUrl, last_qr_generated_at: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "tenant_id, provider" }
      );
    }

    return { success: true, qrUrl, status };
  } catch (error) {
    console.error("Generate WhatsApp QR Error:", error);
    return { success: false, error: "Failed to generate QR code" };
  }
}

export async function checkWhatsAppStatusAction() {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  try {
    const session = await wahaService.getSession({ sessionName: tenantId });
    
    if (session.status === "WORKING") {
      const { error } = await supabase.from("integrations").upsert(
        {
          tenant_id: tenantId,
          provider: "whatsapp",
          status: "active",
          credentials: { type: "baileys" },
          metadata: { qr_url: null }, // Clear QR URL on success
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "tenant_id, provider" },
      );

      if (error) throw new Error(error.message);

      return { connected: true, status: session.status };
    }

    return { connected: false, status: session.status };
  } catch (error) {
    console.error("Check WhatsApp Status Error:", error);
    return { connected: false, status: "ERROR" };
  }
}
