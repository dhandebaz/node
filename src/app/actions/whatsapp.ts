'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function generateWhatsAppQRAction() {
  const tenantId = await requireActiveTenant();

  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/webhook/whatsapp?tenantId=${tenantId}`;
    
    const response = await fetch(`${process.env.WAHA_SERVER_URL}/api/sessions/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: tenantId,
        config: {
          proxy: null,
          webhooks: [
            {
              url: webhookUrl,
              events: ['message']
            }
          ]
        }
      })
    });

    const data = await response.json();
    return { success: true, qrUrl: data.qrcode };

  } catch (error) {
    console.error("Generate WhatsApp QR Error:", error);
    return { success: false, error: "Failed to generate QR code" };
  }
}

export async function checkWhatsAppStatusAction() {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  try {
    const response = await fetch(`${process.env.WAHA_SERVER_URL}/api/sessions/${tenantId}`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.status === 'WORKING') {
        const { error } = await supabase
          .from('integrations')
          .upsert({
            tenant_id: tenantId,
            provider: 'whatsapp',
            status: 'active',
            credentials: { type: 'baileys' },
            updated_at: new Date().toISOString()
          }, { onConflict: 'tenant_id, provider' });

        if (error) throw new Error(error.message);

        return { connected: true };
      }
    }
    
    return { connected: false };
  } catch (error) {
    console.error("Check WhatsApp Status Error:", error);
    return { connected: false };
  }
}
