'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function toggleAIPauseAction(guestId: string, paused: boolean) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from('guests')
    .update({ ai_paused: paused })
    .eq('id', guestId)
    .eq('tenant_id', tenantId);

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function sendManualMessageAction(guestId: string, text: string) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  // Fetch guest
  const { data: guest, error: guestError } = await supabase
    .from('guests')
    .select('phone')
    .eq('id', guestId)
    .eq('tenant_id', tenantId)
    .single();

  if (guestError || !guest) throw new Error('Guest not found');

  // Send via WAHA
  const response = await fetch(process.env.WAHA_SERVER_URL + '/api/sendText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session: tenantId,
      chatId: guest.phone,
      text: text
    })
  });

  if (!response.ok) {
     console.error("WAHA Send Error", await response.text());
     throw new Error("Failed to send message via WhatsApp");
  }

  // Insert outbound message
  const { error: msgError } = await supabase.from('messages').insert({
    tenant_id: tenantId,
    guest_id: guestId, // linking to guest if schema supports it, otherwise logic might rely on phone/sender_id
    // But wait, the webhook uses sender_id as phone. 
    // The messages table schema in webhook implies: 
    // tenant_id, direction, channel, content, sender_id (which is 'ai_assistant' or phone), timestamp, read.
    // It doesn't seem to have guest_id in the webhook insert.
    // However, the prompt says "Insert the message into the messages table with direction: 'outbound'".
    // I should match the schema used in webhook.
    // Webhook uses: tenant_id, direction, channel, content, sender_id, timestamp, read.
    // Sender ID for outbound manual message? 
    // Usually it would be the system or agent. 
    // If 'ai_assistant' is for AI, maybe 'human_agent' or similar?
    // Or just 'manager'. 
    // Let's use 'human_manager' to distinguish.
    direction: 'outbound',
    channel: 'whatsapp',
    content: text,
    sender_id: 'human_manager',
    timestamp: new Date().toISOString(),
    read: true
  });
  
  if (msgError) throw new Error(msgError.message);

  // Pause AI
  await toggleAIPauseAction(guestId, true);

  return { success: true };
}
