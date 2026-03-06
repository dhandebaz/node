'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function saveWhatsAppOfficialCredentials(data: { phoneNumberId: string, accessToken: string }) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from('integrations')
    .upsert({
      tenant_id: tenantId,
      provider: 'whatsapp',
      status: 'active',
      credentials: {
        phoneNumberId: data.phoneNumberId,
        accessToken: data.accessToken
      },
      updated_at: new Date().toISOString()
    }, { onConflict: 'tenant_id, provider' });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
