import { log } from "@/lib/logger";

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  audio?: {
    id: string;
    mime_type: string;
    sha256: string;
  };
  video?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  document?: {
    id: string;
    mime_type: string;
    sha256: string;
    filename: string;
    caption?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contacts?: Array<{
    profile: { name: string };
    phones: Array<{ phone: string; type: string }>;
    emails: Array<{ email: string; type: string }>;
  }>;
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
}

export interface SendTextMessageParams {
  recipientPhone: string;
  message: string;
}

export interface SendTemplateParams {
  recipientPhone: string;
  templateName: string;
  languageCode?: string;
  components?: Array<{
    type: string;
    parameters?: Array<{ type: string; text?: string }>;
  }>;
}

export interface SendMediaMessageParams {
  recipientPhone: string;
  mediaType: "image" | "video" | "audio" | "document";
  mediaUrl: string;
  caption?: string;
  filename?: string;
}

export interface WhatsAppBusinessConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId?: string;
  appSecret?: string;
  verifyToken?: string;
}

const GRAPH_API_VERSION = "v21.0";

export const whatsappBusinessService = {
  /**
   * Sends a text message via WhatsApp Business API
   */
  async sendText(params: SendTextMessageParams, config: WhatsAppBusinessConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { recipientPhone, message } = params;
    const { accessToken, phoneNumberId } = config;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: recipientPhone,
            type: "text",
            text: {
              preview_url: false,
              body: message,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        log.error("[WhatsAppBusiness] Send text failed", { status: response.status, error: data });
        return { success: false, error: data.error?.message || `HTTP ${response.status}` };
      }

      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error("[WhatsAppBusiness] Send text exception", { error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Sends a media message (image, video, audio, document)
   */
  async sendMedia(params: SendMediaMessageParams, config: WhatsAppBusinessConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { recipientPhone, mediaType, mediaUrl, caption, filename } = params;
    const { accessToken, phoneNumberId } = config;

    try {
      const mediaObject = {
        link: mediaUrl,
      };

      const body: any = {
        messaging_product: "whatsapp",
        to: recipientPhone,
        type: mediaType,
        [mediaType]: {
          ...mediaObject,
          ...(caption && { caption }),
          ...(filename && mediaType === "document" && { filename }),
        },
      };

      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        log.error("[WhatsAppBusiness] Send media failed", { status: response.status, error: data });
        return { success: false, error: data.error?.message || `HTTP ${response.status}` };
      }

      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error("[WhatsAppBusiness] Send media exception", { error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Sends a template message
   */
  async sendTemplate(params: SendTemplateParams, config: WhatsAppBusinessConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { recipientPhone, templateName, languageCode = "en", components } = params;
    const { accessToken, phoneNumberId } = config;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: recipientPhone,
            type: "template",
            template: {
              name: templateName,
              language: {
                code: languageCode,
              },
              ...(components && { components }),
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        log.error("[WhatsAppBusiness] Send template failed", { status: response.status, error: data });
        return { success: false, error: data.error?.message || `HTTP ${response.status}` };
      }

      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error("[WhatsAppBusiness] Send template exception", { error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Downloads media content from WhatsApp servers
   */
  async downloadMedia(mediaId: string, config: WhatsAppBusinessConfig): Promise<{ success: boolean; url?: string; error?: string }> {
    const { accessToken } = config;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${mediaId}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message };
      }

      return { success: true, url: data.url };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Marks messages as read
   */
  async markAsRead(messageId: string, config: WhatsAppBusinessConfig): Promise<boolean> {
    const { accessToken, phoneNumberId } = config;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            status: "read",
            message_id: messageId,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      log.error("[WhatsAppBusiness] Mark as read failed", { error });
      return false;
    }
  },

  /**
   * Gets phone number details
   */
  async getPhoneNumber(phoneNumberId: string, config: WhatsAppBusinessConfig): Promise<{ success: boolean; data?: any; error?: string }> {
    const { accessToken } = config;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message };
      }

      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Registers a webhook for WhatsApp Business API
   */
  async registerWebhook(webhookUrl: string, config: WhatsAppBusinessConfig): Promise<boolean> {
    const { accessToken, businessAccountId } = config;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${businessAccountId}/subscribed_apps`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        log.error("[WhatsAppBusiness] Register webhook failed", { status: response.status });
        return false;
      }

      log.info("[WhatsAppBusiness] Webhook registered successfully", { webhookUrl });
      return true;
    } catch (error) {
      log.error("[WhatsAppBusiness] Register webhook exception", { error });
      return false;
    }
  },

  /**
   * Verifies webhook signature (HMAC-SHA256)
   */
  verifyWebhookSignature(payload: string, signature: string | null, appSecret: string): boolean {
    if (!appSecret || !signature) return true;

    const crypto = require("crypto");
    const expectedSignature = "sha256=" + crypto
      .createHmac("sha256", appSecret)
      .update(payload)
      .digest("hex");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  },
};
