import { wahaService } from "./wahaService";
import { getSupabaseServer } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

export type MessageChannel = 'whatsapp' | 'instagram' | 'messenger' | 'sms' | 'email';

export interface OutboundMessage {
  tenantId: string;
  recipientId: string; // phone number, IG handle, or Meta scoped ID
  content: string;
  channel: MessageChannel;
  metadata?: Record<string, any>;
}

export const ChannelService = {
  /**
   * Dispatches an outbound message to the appropriate provider based on the channel.
   * All channels either dispatch via real API or log a tracked failure — no simulated responses.
   */
  async sendMessage(params: OutboundMessage) {
    const { tenantId, recipientId, content, channel } = params;

    log.info(`[ChannelService] Dispatching ${channel} message to ${recipientId} for tenant ${tenantId}`);

    switch (channel) {
      case 'whatsapp':
        return await wahaService.sendText({
          sessionName: tenantId,
          chatId: recipientId,
          text: content
        });

      case 'instagram':
      case 'messenger': {
        // Meta Graph API Send: requires a Page Access Token stored in the integrations table
        const supabase = await getSupabaseServer();
        const { data: integration } = await supabase
          .from('integrations')
          .select('credentials')
          .eq('tenant_id', tenantId)
          .eq('provider', 'meta')
          .eq('enabled', true)
          .maybeSingle();

        const pageAccessToken = integration?.credentials?.page_access_token;
        if (!pageAccessToken) {
          await this.recordFailure(tenantId, 'integration', channel, 'Meta Page Access Token not configured. Connect Instagram/Messenger in Integrations.');
          return { success: false, error: `${channel} not connected. Configure Meta integration first.` };
        }

        try {
          const response = await fetch(`https://graph.facebook.com/v19.0/me/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${pageAccessToken}`
            },
            body: JSON.stringify({
              recipient: { id: recipientId },
              message: { text: content }
            })
          });

          if (!response.ok) {
            const errorBody = await response.text();
            log.error(`[ChannelService] Meta API error for ${channel}`, { status: response.status, body: errorBody });
            await this.recordFailure(tenantId, 'integration', channel, `Meta API returned ${response.status}: ${errorBody.slice(0, 200)}`);
            return { success: false, error: `Meta API error: ${response.status}` };
          }

          const result = await response.json();
          return { success: true, messageId: result.message_id };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          log.error(`[ChannelService] Meta dispatch failed`, { error: message });
          await this.recordFailure(tenantId, 'integration', channel, `Meta dispatch error: ${message}`);
          return { success: false, error: message };
        }
      }

      case 'sms':
        // SMS requires Twilio/MSG91 integration — not yet connected for this tenant
        await this.recordFailure(tenantId, 'integration', 'sms', 'SMS provider not configured. Connect Twilio or MSG91 in Integrations.');
        return { success: false, error: 'SMS provider not configured' };

      case 'email':
        // Email requires SMTP or Resend integration
        await this.recordFailure(tenantId, 'integration', 'email', 'Email provider not configured.');
        return { success: false, error: 'Email provider not configured' };

      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  },

  /**
   * Records a dispatch failure to the failures table for observability.
   */
  async recordFailure(tenantId: string, category: string, source: string, message: string) {
    try {
      const supabase = await getSupabaseServer();
      await supabase.from('failures').insert({
        tenant_id: tenantId,
        category,
        source,
        severity: 'warning',
        message,
        is_active: true
      });
    } catch (e) {
      log.error('[ChannelService] Failed to record failure', { error: e });
    }
  },

  /**
   * Utility to resolve the correct channel for a guest and dispatch.
   */
  async sendToGuest(tenantId: string, guestId: string, content: string) {
    const supabase = await getSupabaseServer();
    
    const { data: guest, error } = await supabase
      .from('guests')
      .select('phone, channel')
      .eq('id', guestId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !guest) {
      throw new Error(`Guest ${guestId} not found`);
    }

    const recipientId = guest.phone || guestId; 

    return await this.sendMessage({
      tenantId,
      recipientId,
      content,
      channel: (guest.channel as MessageChannel) || 'whatsapp'
    });
  }
};
