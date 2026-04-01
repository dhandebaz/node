import { log } from "@/lib/logger";

export interface IGPublishMediaParams {
  mediaUrl: string;
  caption?: string;
  locationId?: string;
  userTags?: Array<{ username: string; x: number; y: number }>;
}

const GRAPH_API_VERSION = "v21.0";

export class MetaPublishingService {
  /**
   * Publish an Instagram Post (Image or Video)
   */
  static async publishInstagramMedia(igBusinessAccountId: string, accessToken: string, params: IGPublishMediaParams) {
    try {
      // 1. Create Media Container
      const containerResponse = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${igBusinessAccountId}/media?` +
        new URLSearchParams({
          image_url: params.mediaUrl,
          caption: params.caption || "",
          access_token: accessToken
        }),
        { method: "POST" }
      );

      const containerData = await containerResponse.json();
      if (!containerResponse.ok) throw new Error(containerData.error?.message || "Failed to create media container");

      const creationId = containerData.id;

      // 2. Publish Media
      const publishResponse = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${igBusinessAccountId}/media_publish?` +
        new URLSearchParams({
          creation_id: creationId,
          access_token: accessToken
        }),
        { method: "POST" }
      );

      const publishData = await publishResponse.json();
      if (!publishResponse.ok) throw new Error(publishData.error?.message || "Failed to publish media");

      log.info("[MetaPublishing] Instagram media published", { id: publishData.id });
      return { success: true, id: publishData.id };
    } catch (e) {
      log.error("[MetaPublishing] Instagram publish failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Publish an Instagram Story
   */
  static async publishInstagramStory(igBusinessAccountId: string, accessToken: string, mediaUrl: string) {
    try {
      const containerResponse = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${igBusinessAccountId}/media?` +
        new URLSearchParams({
          image_url: mediaUrl,
          media_type: "STORIES",
          access_token: accessToken
        }),
        { method: "POST" }
      );

      const containerData = await containerResponse.json();
      if (!containerResponse.ok) throw new Error(containerData.error?.message || "Failed to create story container");

      const creationId = containerData.id;

      const publishResponse = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${igBusinessAccountId}/media_publish?` +
        new URLSearchParams({
          creation_id: creationId,
          access_token: accessToken
        }),
        { method: "POST" }
      );

      const publishData = await publishResponse.json();
      if (!publishResponse.ok) throw new Error(publishData.error?.message || "Failed to publish story");

      return { success: true, id: publishData.id };
    } catch (e) {
      log.error("[MetaPublishing] Instagram story publish failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Publish a Facebook Page Post
   */
  static async publishPagePost(pageId: string, accessToken: string, message: string, link?: string) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/feed`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            ...(link && { link })
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to publish page post");

      log.info("[MetaPublishing] Facebook Page post published", { id: data.id });
      return { success: true, id: data.id };
    } catch (e) {
      log.error("[MetaPublishing] Page post failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }
}
