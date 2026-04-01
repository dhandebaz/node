import { log } from "@/lib/logger";

export interface GoogleBusinessConfig {
  accessToken: string;
  refreshToken: string;
  businessAccountId: string;
  locationId: string;
  projectId: string;
}

export interface BusinessMessage {
  name: string;
  text: string;
  sender: {
    name: string;
    userId: string;
  };
  createTime: string;
  messageId: string;
}

export interface SendMessageParams {
  recipientId: string;
  message: string;
  conversationId?: string;
}

export interface SendCardParams {
  recipientId: string;
  card: {
    title: string;
    description: string;
    suggestions?: Array<{ text: string; action?: string }>;
    media?: { contentUrl: string; height: string };
  };
}

export interface SendSuggestionsParams {
  recipientId: string;
  suggestions: Array<{
    text: string;
    action?: { openLink: { url: string } } | { dialPhoneNumber: { phoneNumber: string } } | { composeTextResponse: { text: string } };
  }>;
}

export const googleBusinessService = {
  /**
   * Get OAuth URL for Google Business API
   */
  getOAuthUrl(state: string): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/business/callback`;

    const scopes = [
      "https://www.googleapis.com/auth/businessmessages",
      "https://www.googleapis.com/auth/businessmanagement",
    ];

    const params = new URLSearchParams({
      client_id: clientId || "",
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{ success: boolean; tokens?: { access_token: string; refresh_token: string; expires_in: number }; error?: string }> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/business/callback`;

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        log.error("[GoogleBusiness] Token exchange failed", { error: data });
        return { success: false, error: data.error_description || "Token exchange failed" };
      }

      return {
        success: true,
        tokens: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error("[GoogleBusiness] Token exchange exception", { error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ success: boolean; tokens?: { access_token: string; expires_in: number }; error?: string }> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error_description || "Refresh failed" };
      }

      return {
        success: true,
        tokens: {
          access_token: data.access_token,
          expires_in: data.expires_in,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Get business locations
   */
  async getLocations(config: GoogleBusinessConfig): Promise<{ success: boolean; locations?: Array<{ name: string; locationName: string; address: string }>; error?: string }> {
    try {
      const response = await fetch(
        `https://businessbusinessmanagement.googleapis.com/v1/accounts/${config.businessAccountId}/locations`,
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message || "Failed to get locations" };
      }

      const locations = (data.locations || []).map((loc: any) => ({
        name: loc.name,
        locationName: loc.locationName,
        address: loc.address?.addressLines?.join(", "),
      }));

      return { success: true, locations };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Register webhook for Google Business Messages
   */
  async registerWebhook(config: GoogleBusinessConfig): Promise<boolean> {
    try {
      const response = await fetch(
        `https://businessmessages.googleapis.com/v1/accounts/${config.businessAccountId}/webhooks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `accounts/${config.businessAccountId}/webhooks/primary`,
            httpUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/webhook/google-business?tenantId=${config.businessAccountId}`,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      log.error("[GoogleBusiness] Register webhook failed", { error });
      return false;
    }
  },

  /**
   * Send text message
   */
  async sendText(params: SendMessageParams, config: GoogleBusinessConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch(
        `https://businessmessages.googleapis.com/v1/conversations/${params.conversationId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            text: params.message,
            representative: {
              representativeType: "BRAND",
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        log.error("[GoogleBusiness] Send text failed", { error: data });
        return { success: false, error: data.error?.message || `HTTP ${response.status}` };
      }

      return { success: true, messageId: data.name };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error("[GoogleBusiness] Send text exception", { error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Send suggestion chips
   */
  async sendSuggestions(params: SendSuggestionsParams, config: GoogleBusinessConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `https://businessmessages.googleapis.com/v1/conversations/${params.recipientId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            representative: {
              representativeType: "BRAND",
            },
            suggestions: params.suggestions.map((s) => ({
              suggestedReply: {
                text: s.text,
                ...(s.action && { action: s.action }),
              },
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Send Rich Card (carousel, etc.)
   */
  async sendRichCard(params: {
    recipientId: string;
    cards: Array<{
      title: string;
      description?: string;
      image?: { url: string };
      suggestions?: Array<{ text: string }>;
    }>;
  }, config: GoogleBusinessConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `https://businessmessages.googleapis.com/v1/conversations/${params.recipientId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            contentMessage: {
              richCard: {
                carouselCard: {
                  cards: params.cards.map((card) => ({
                    cardHeader: {
                      title: card.title,
                      imageStyle: "CROPPED",
                      ...(card.image && { image: { rawImageUrl: card.image.url } }),
                    },
                    cardContent: {
                      title: card.title,
                      description: card.description,
                      suggestions: card.suggestions?.map((s) => ({
                        suggestedReply: { text: s.text },
                      })),
                    },
                  })),
                },
              },
            },
            representative: {
              representativeType: "BRAND",
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  /**
   * Parse incoming webhook message
   */
  parseIncomingMessage(body: any): BusinessMessage | null {
    try {
      const message = body.message;
      if (!message) return null;

      return {
        name: message.name,
        text: message.text || "",
        sender: {
          name: message.sender?.displayName || "Unknown",
          userId: message.sender?.userId || "",
        },
        createTime: message.createTime,
        messageId: message.name,
      };
    } catch (error) {
      log.error("[GoogleBusiness] Parse message failed", { error });
      return null;
    }
  },
};
