'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function generateWhatsAppQRAction() {
  await requireActiveTenant();
  
  // In a real implementation, this would initiate a session with the WhatsApp provider
  // For this simulated flow, we return a static/generated QR code
  
  return { 
    success: true, 
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=nodebase-wa-simulated-session' 
  };
}

export async function confirmWhatsAppScanAction() {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();
  
  // 1. Check if integration exists, if not create it
  // We'll use upsert logic or update
  
  // First, check if row exists
  const { data: existing } = await supabase
    .from('integrations')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('provider', 'whatsapp')
    .maybeSingle();
    
  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('integrations')
      .update({
        status: 'active',
        credentials: { type: "baileys_session" },
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
      
    if (error) throw new Error(error.message);
  } else {
    // Create new
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");
    
    const { error } = await supabase
      .from('integrations')
      .insert({
        tenant_id: tenantId,
        user_id: user.id,
        provider: 'whatsapp',
        status: 'active',
        credentials: { type: "baileys_session" },
        updated_at: new Date().toISOString()
      });
      
    if (error) throw new Error(error.message);
  }

  return { success: true };
}
