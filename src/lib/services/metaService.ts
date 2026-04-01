import { log } from "@/lib/logger";

export interface MetaMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  audio?: { id: string; mime_type: string; sha256: string };
  image?: { id: string; mime_type: string; sha256: string; caption?: string };
  video?: { id: string; mime_type: string; sha256: string };
  document?: { id: string; mime_type: string; sha256: string; filename?: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  sticker?: { id: string; mime_type: string; sha256: string };
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

export interface SendMessageParams {
  recipientId: string;
  message: string;
}

export type MetaMediaType = "image" | "video" | "audio" | "file";

export interface SendMediaParams {
  recipientId: string;
  mediaType: MetaMediaType;
  mediaUrl: string;
  caption?: string;
}

export interface SendTemplateParams {
  recipientId: string;
  templateName: string;
  languageCode?: string;
  components?: Array<{
    type: string;
    parameters?: Array<{ type: string; text?: string; image?: { link: string } }>;
  }>;
}

export interface SendQuickReplyParams {
  recipientId: string;
  message: string;
  buttons: Array<{ text: string; title?: string; payload?: string }>;
}

export interface MetaConfig {
  accessToken: string;
  pageId: string;
  appId?: string;
  appSecret?: string;
}

export interface MetaOAuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

const GRAPH_API_VERSION = "v21.0";

export const metaService = {
  /**
   * Get page access token via OAuth code
   */
  async getAccessTokenFromCode(code: string, redirectUri: string): Promise<{ success: boolean; data?: MetaOAuthTokens; error?: string }> {
    const clientId = process.env.META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;

    if (!clientId || !clientSecret) {
      return { success: false, error: "Meta app credentials not configured" };
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/oauth/access_token?` +
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        })
      );

      const data = await response.json();

      if (!response.ok) {
        log.error("[Meta] Token exchange failed", { error: data });
        return { success: false, error: data.error?.message || "Token exchange failed" };
      }

      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error("[Meta] Token exchange exception", { error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Get long-lived page access token
   */
  async getLongLivedToken(shortLivedToken: string): Promise<{ success: boolean; data?: { access_token: string; token_type: string; expires_in: number }; error?: string }> {
    const clientId = process.env.META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;

    if (!clientId || !clientSecret) {
      return { success: false, error: "Meta app credentials not configured" };
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: clientId,
          client_secret: clientSecret,
          fb_exchange_token: shortLivedToken,
        })
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message || "Failed to get long-lived token" };
      }

      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Get pages for a user
   */
  async getUserPages(accessToken: string): Promise<{ success: boolean; pages?: Array<{ id: string; name: string; access_token: string; category: string }>; error?: string }> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/me/accounts?access_token=${accessToken}`
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message || "Failed to get pages" };
      }

      return { success: true, pages: data.data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Get Instagram accounts linked to a page
   */
  async getInstagramAccounts(pageAccessToken: string): Promise<{ success: boolean; accounts?: Array<{ id: string; username: string; name: string }>; error?: string }> {
    try {
      // First get the Instagram business account ID
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/me/accounts?` +
        new URLSearchParams({ access_token: pageAccessToken })
      );

      const data = await response.json();
      if (!data.data?.[0]) {
        return { success: false, error: "No pages found" };
      }

      const pageId = data.data[0].id;

      // Get Instagram accounts
      const igResponse = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}?` +
        new URLSearchParams({
          fields: "instagram_business_account",
          access_token: pageAccessToken,
        })
      );

      const igData = await igResponse.json();

      if (!igData.instagram_business_account) {
        return { success: false, error: "No Instagram business account linked to this page" };
      }

      // Get Instagram account details
      const igDetailsResponse = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${igData.instagram_business_account.id}?` +
        new URLSearchParams({
          fields: "id,username,name",
          access_token: pageAccessToken,
        })
      );

      const igDetails = await igDetailsResponse.json();

      return {
        success: true,
        accounts: [{
          id: igData.instagram_business_account.id,
          username: igDetails.username,
          name: igDetails.name || igDetails.username,
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Send text message via Instagram/Messenger
   */
  async sendText(params: SendMessageParams, config: MetaConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { recipientId, message } = params;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: message },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        log.error("[Meta] Send text failed", { status: response.status, error: data });
        return { success: false, error: data.error?.message || `HTTP ${response.status}` };
      }

      return { success: true, messageId: data.message_id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error("[Meta] Send text exception", { error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Send media message
   */
  async sendMedia(params: SendMediaParams, config: MetaConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { recipientId, mediaType, mediaUrl, caption } = params;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: {
              attachment: {
                type: mediaType,
                payload: {
                  url: mediaUrl,
                  is_reusable: true,
                  ...(caption && mediaType === "image" && { caption }),
                },
              },
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message || `HTTP ${response.status}` };
      }

      return { success: true, messageId: data.message_id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Send template message (buttons, lists, etc.)
   */
  async sendTemplate(params: SendTemplateParams, config: MetaConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { recipientId, templateName, languageCode = "en", components } = params;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "button",
                  text: templateName,
                  ...(components && { components }),
                },
              },
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message || `HTTP ${response.status}` };
      }

      return { success: true, messageId: data.message_id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Send quick reply buttons
   */
  async sendQuickReply(params: SendQuickReplyParams, config: MetaConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { recipientId, message, buttons } = params;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: {
              text: message,
              quick_replies: buttons.map((btn) => ({
                content_type: "text",
                title: (btn.text || btn.title || "").slice(0, 20),
                payload: btn.payload || btn.text || btn.title || "",
              })),
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message || `HTTP ${response.status}` };
      }

      return { success: true, messageId: data.message_id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string, config: MetaConfig): Promise<boolean> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: { thread_owner_id: config.pageId },
            sender_action: "mark_seen",
          }),
        }
      );

      return response.ok;
    } catch (error) {
      log.error("[Meta] Mark as read failed", { error });
      return false;
    }
  },

  /**
   * Get user profile info
   */
  async getUserProfile(userId: string, config: MetaConfig): Promise<{ success: boolean; profile?: { name: string; profile_pic: string; email?: string }; error?: string }> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${userId}?` +
        new URLSearchParams({
          fields: "name,profile_pic,email",
          access_token: config.accessToken,
        })
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message };
      }

      return {
        success: true,
        profile: {
          name: data.name,
          profile_pic: data.profile_pic,
          email: data.email,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Subscribe app to page for webhooks
   */
  async subscribeToPage(pageId: string, accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/subscribed_apps`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscribed_fields: ["messages", "message_deliveries", "message_reads", "message_reactions"],
          }),
        }
      );

      if (!response.ok) {
        log.error("[Meta] Subscribe to page failed");
        return false;
      }

      return true;
    } catch (error) {
      log.error("[Meta] Subscribe exception", { error });
      return false;
    }
  },

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string | null): boolean {
    const appSecret = process.env.META_APP_SECRET;
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
