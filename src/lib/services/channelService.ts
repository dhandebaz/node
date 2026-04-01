import { ChannelManager, type Channel } from "./channelManager";
import { getSupabaseServer } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

export type MessageChannel = 'whatsapp' | 'instagram' | 'messenger' | 'sms' | 'email' | 'telegram';

export interface OutboundMessage {
  tenantId: string;
  recipientId: string;
  content: string;
  channel: MessageChannel;
  metadata?: Record<string, any>;
}

export const ChannelService = {
  /**
   * Dispatches an outbound message to the appropriate provider based on the channel.
   */
  async sendMessage(params: OutboundMessage) {
    const { tenantId, recipientId, content, channel } = params;

    log.info(`[ChannelService] Dispatching ${channel} message to ${recipientId} for tenant ${tenantId}`);

    try {
      const result = await ChannelManager.sendMessage(tenantId, {
        channel: channel as Channel,
        recipientId,
        content,
        metadata: params.metadata,
      });

      if (!result.success && result.error) {
        await this.recordFailure(tenantId, 'integration', channel, result.error);
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.recordFailure(tenantId, 'integration', channel, message);
      return { success: false, error: message };
    }
  },

  /**
   * Send media message through any channel
   */
  async sendMedia(
    tenantId: string,
    channel: MessageChannel,
    recipientId: string,
    mediaType: "image" | "video" | "audio" | "document",
    mediaUrl: string,
    caption?: string
  ) {
    try {
      const result = await ChannelManager.sendMedia(
        tenantId,
        channel as Channel,
        recipientId,
        mediaType,
        mediaUrl,
        caption
      );

      if (!result.success && result.error) {
        await this.recordFailure(tenantId, 'integration', channel, result.error);
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.recordFailure(tenantId, 'integration', channel, message);
      return { success: false, error: message };
    }
  },

  /**
   * Send quick reply buttons
   */
  async sendQuickReply(
    tenantId: string,
    channel: MessageChannel,
    recipientId: string,
    message: string,
    buttons: Array<{ text: string; payload?: string }>
  ) {
    try {
      const result = await ChannelManager.sendQuickReply(
        tenantId,
        channel as Channel,
        recipientId,
        message,
        buttons
      );

      if (!result.success && result.error) {
        await this.recordFailure(tenantId, 'integration', channel, result.error);
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.recordFailure(tenantId, 'integration', channel, message);
      return { success: false, error: message };
    }
  },

  /**
   * Check if a channel is configured for a tenant
   */
  async isChannelConfigured(tenantId: string, channel: MessageChannel): Promise<boolean> {
    return ChannelManager.isChannelConfigured(tenantId, channel as Channel);
  },

  /**
   * Get all configured channels for a tenant
   */
  async getConfiguredChannels(tenantId: string): Promise<Channel[]> {
    return ChannelManager.getConfiguredChannels(tenantId);
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
      .select('phone')
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
      channel: 'whatsapp'
    });
  }
};
