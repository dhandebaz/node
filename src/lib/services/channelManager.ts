import { log } from "@/lib/logger";
import { whatsappBusinessService, type WhatsAppBusinessConfig } from "./whatsappBusinessService";
import { metaService, type MetaConfig, type MetaMediaType } from "./metaService";
import { googleBusinessService, type GoogleBusinessConfig } from "./googleBusinessService";

export type Channel = "whatsapp" | "instagram" | "messenger" | "google-business" | "telegram" | "sms" | "email";

export interface ChannelCredentials {
  channel: Channel;
  credentials: Record<string, any>;
}

export interface OutboundMessage {
  channel: Channel;
  recipientId: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface ChannelResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

type WhatsAppMediaType = "image" | "video" | "audio" | "document";

async function getWhatsAppConfig(tenantId: string): Promise<WhatsAppBusinessConfig | null> {
  const { getSupabaseServer } = await import("@/lib/supabase/server");
  const supabase = await getSupabaseServer();

  const { data: integration } = await supabase
    .from("integrations")
    .select("credentials")
    .eq("tenant_id", tenantId)
    .eq("provider", "whatsapp")
    .eq("status", "active")
    .maybeSingle();

  if (!integration?.credentials) return null;

  const creds = integration.credentials as any;
  return {
    accessToken: creds.access_token,
    phoneNumberId: creds.phone_number_id,
    businessAccountId: creds.business_account_id,
  };
}

async function getMetaConfig(tenantId: string): Promise<MetaConfig | null> {
  const { getSupabaseServer } = await import("@/lib/supabase/server");
  const supabase = await getSupabaseServer();

  const { data: integration } = await supabase
    .from("integrations")
    .select("credentials")
    .eq("tenant_id", tenantId)
    .eq("provider", "meta")
    .eq("status", "active")
    .maybeSingle();

  if (!integration?.credentials) return null;

  const creds = integration.credentials as any;
  return {
    accessToken: creds.page_access_token,
    pageId: creds.page_id,
  };
}

async function getTelegramConfig(tenantId: string): Promise<string | null> {
  const { getSupabaseServer } = await import("@/lib/supabase/server");
  const supabase = await getSupabaseServer();

  const { data: integration } = await supabase
    .from("integrations")
    .select("credentials")
    .eq("tenant_id", tenantId)
    .eq("provider", "telegram")
    .eq("status", "active")
    .maybeSingle();

  if (!integration?.credentials) return null;

  const creds = integration.credentials as any;
  return creds.bot_token;
}

async function getGoogleBusinessConfig(tenantId: string): Promise<GoogleBusinessConfig | null> {
  const { getSupabaseServer } = await import("@/lib/supabase/server");
  const supabase = await getSupabaseServer();

  const { data: integration } = await supabase
    .from("integrations")
    .select("credentials")
    .eq("tenant_id", tenantId)
    .eq("provider", "google-business")
    .eq("status", "active")
    .maybeSingle();

  if (!integration?.credentials) return null;

  const creds = integration.credentials as any;
  return {
    accessToken: creds.access_token,
    refreshToken: creds.refresh_token,
    businessAccountId: creds.business_account_id,
    locationId: creds.location_id,
    projectId: creds.project_id,
  };
}

export const ChannelManager = {
  /**
   * Send a message through any channel
   */
  async sendMessage(tenantId: string, params: OutboundMessage): Promise<ChannelResult> {
    const { channel, recipientId, content, metadata } = params;

    log.info(`[ChannelManager] Sending ${channel} message to ${recipientId}`);

    try {
      switch (channel) {
        case "whatsapp": {
          const config = await getWhatsAppConfig(tenantId);
          if (!config) {
            return { success: false, error: "WhatsApp not configured" };
          }
          const result = await whatsappBusinessService.sendText(
            { recipientPhone: recipientId, message: content },
            config
          );
          return { success: result.success, messageId: result.messageId, error: result.error };
        }

        case "instagram":
        case "messenger": {
          const config = await getMetaConfig(tenantId);
          if (!config) {
            return { success: false, error: "Meta not configured" };
          }
          const result = await metaService.sendText(
            { recipientId, message: content },
            config
          );
          return { success: result.success, messageId: result.messageId, error: result.error };
        }

        case "telegram": {
          const botToken = await getTelegramConfig(tenantId);
          if (!botToken) {
            return { success: false, error: "Telegram not configured" };
          }
          const response = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: recipientId,
                text: content,
                parse_mode: "Markdown",
              }),
            }
          );
          const data = await response.json();
          if (!response.ok) {
            return { success: false, error: data.description };
          }
          return { success: true, messageId: data.result?.message_id?.toString() };
        }

        case "google-business": {
          const config = await getGoogleBusinessConfig(tenantId);
          if (!config) {
            return { success: false, error: "Google Business not configured" };
          }
          const result = await googleBusinessService.sendText(
            { recipientId, message: content },
            config
          );
          return { success: result.success, messageId: result.messageId, error: result.error };
        }

        case "sms": {
          return { success: false, error: "SMS provider not configured" };
        }

        case "email": {
          return { success: false, error: "Email provider not configured" };
        }

        default:
          return { success: false, error: `Unknown channel: ${channel}` };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error(`[ChannelManager] ${channel} send failed`, { error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Send media message
   */
  async sendMedia(
    tenantId: string,
    channel: Channel,
    recipientId: string,
    mediaType: WhatsAppMediaType,
    mediaUrl: string,
    caption?: string
  ): Promise<ChannelResult> {
    try {
      switch (channel) {
        case "whatsapp": {
          const config = await getWhatsAppConfig(tenantId);
          if (!config) return { success: false, error: "WhatsApp not configured" };
          const result = await whatsappBusinessService.sendMedia(
            { recipientPhone: recipientId, mediaType, mediaUrl, caption },
            config
          );
          return { success: result.success, messageId: result.messageId, error: result.error };
        }

        case "instagram":
        case "messenger": {
          const config = await getMetaConfig(tenantId);
          if (!config) return { success: false, error: "Meta not configured" };
          const metaMediaType: MetaMediaType = mediaType === "document" ? "file" : mediaType;
          const result = await metaService.sendMedia(
            { recipientId, mediaType: metaMediaType, mediaUrl, caption },
            config
          );
          return { success: result.success, messageId: result.messageId, error: result.error };
        }

        case "telegram": {
          const botToken = await getTelegramConfig(tenantId);
          if (!botToken) return { success: false, error: "Telegram not configured" };

          const fieldName = mediaType === "video" ? "video" : mediaType === "audio" ? "audio" : mediaType === "document" ? "document" : "photo";

          const response = await fetch(
            `https://api.telegram.org/bot${botToken}/send${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: recipientId,
                [fieldName]: mediaUrl,
                ...(caption && fieldName !== "audio" && { caption }),
              }),
            }
          );
          const data = await response.json();
          return data.ok
            ? { success: true, messageId: data.result?.message_id?.toString() }
            : { success: false, error: data.description };
        }

        default:
          return { success: false, error: `Media not supported on ${channel}` };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Send quick reply buttons
   */
  async sendQuickReply(
    tenantId: string,
    channel: Channel,
    recipientId: string,
    message: string,
    buttons: Array<{ text: string; payload?: string }>
  ): Promise<ChannelResult> {
    try {
      switch (channel) {
        case "instagram":
        case "messenger": {
          const config = await getMetaConfig(tenantId);
          if (!config) return { success: false, error: "Meta not configured" };
          const result = await metaService.sendQuickReply(
            { recipientId, message, buttons },
            config
          );
          return { success: result.success, messageId: result.messageId, error: result.error };
        }

        case "telegram": {
          const botToken = await getTelegramConfig(tenantId);
          if (!botToken) return { success: false, error: "Telegram not configured" };

          const inlineKeyboard = buttons.map((btn) => [
            { text: btn.text, callback_data: btn.payload || btn.text },
          ]);

          const response = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: recipientId,
                text: message,
                reply_markup: { inline_keyboard: inlineKeyboard },
              }),
            }
          );
          const data = await response.json();
          return data.ok
            ? { success: true, messageId: data.result?.message_id?.toString() }
            : { success: false, error: data.description };
        }

        default:
          return { success: false, error: `Quick replies not supported on ${channel}` };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Check if a channel is configured for a tenant
   */
  async isChannelConfigured(tenantId: string, channel: Channel): Promise<boolean> {
    switch (channel) {
      case "whatsapp":
        return !!(await getWhatsAppConfig(tenantId));
      case "instagram":
      case "messenger":
        return !!(await getMetaConfig(tenantId));
      case "telegram":
        return !!(await getTelegramConfig(tenantId));
      case "google-business":
        return !!(await getGoogleBusinessConfig(tenantId));
      default:
        return false;
    }
  },

  /**
   * Get all configured channels for a tenant
   */
  async getConfiguredChannels(tenantId: string): Promise<Channel[]> {
    const channels: Channel[] = [];

    if (await this.isChannelConfigured(tenantId, "whatsapp")) channels.push("whatsapp");
    if (await this.isChannelConfigured(tenantId, "instagram")) channels.push("instagram");
    if (await this.isChannelConfigured(tenantId, "messenger")) channels.push("messenger");
    if (await this.isChannelConfigured(tenantId, "telegram")) channels.push("telegram");
    if (await this.isChannelConfigured(tenantId, "google-business")) channels.push("google-business");

    return channels;
  },

  /**
   * Record failure for monitoring
   */
  async recordFailure(
    tenantId: string,
    channel: Channel,
    recipientId: string,
    error: string
  ): Promise<void> {
    try {
      const { getSupabaseServer } = await import("@/lib/supabase/server");
      const supabase = await getSupabaseServer();

      await supabase.from("failures").insert({
        tenant_id: tenantId,
        category: "channel_dispatch",
        source: channel,
        severity: "error",
        message: error,
        metadata: { recipientId },
        is_active: true,
      });
    } catch (e) {
      log.error("[ChannelManager] Failed to record failure", { error: e });
    }
  },
};
