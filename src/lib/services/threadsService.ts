import { log } from "@/lib/logger";

export interface ThreadsPostParams {
  mediaUrl: string;
  text?: string;
  isCarousel?: boolean;
}

const THREADS_API_URL = "https://graph.threads.net/v1.0";

export class ThreadsService {
  /**
   * Create and Publish a Threads Post (Media or Text)
   */
  static async postThread(userId: string, accessToken: string, params: ThreadsPostParams) {
    try {
      // 1. Create Media Container
      const containerResponse = await fetch(
        `${THREADS_API_URL}/${userId}/threads?` +
        new URLSearchParams({
          media_type: params.mediaUrl.toLowerCase().endsWith(".mp4") ? "VIDEO" : "IMAGE",
          image_url: params.mediaUrl, // Note: Use video_url if type is VIDEO
          text: params.text || "",
          access_token: accessToken
        }),
        { method: "POST" }
      );

      const containerData = await containerResponse.json();
      if (!containerResponse.ok) throw new Error(containerData.error?.message || "Failed to create threads container");

      const creationId = containerData.id;

      // 2. Publish the Container
      const publishResponse = await fetch(
        `${THREADS_API_URL}/${userId}/threads_publish?` +
        new URLSearchParams({
          creation_id: creationId,
          access_token: accessToken
        }),
        { method: "POST" }
      );

      const publishData = await publishResponse.json();
      if (!publishResponse.ok) throw new Error(publishData.error?.message || "Failed to publish threads post");

      log.info("[ThreadsService] Post published", { id: publishData.id });
      return { success: true, id: publishData.id };
    } catch (e) {
      log.error("[ThreadsService] Post failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Reply to a Thread
   */
  static async replyToThread(userId: string, accessToken: string, threadId: string, text: string) {
    try {
      const response = await fetch(
        `${THREADS_API_URL}/${userId}/threads?` +
        new URLSearchParams({
          media_type: "TEXT",
          text,
          reply_to_id: threadId,
          access_token: accessToken
        }),
        { method: "POST" }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to post reply");

      const creationId = data.id;

      const publishResponse = await fetch(
        `${THREADS_API_URL}/${userId}/threads_publish?` +
        new URLSearchParams({
          creation_id: creationId,
          access_token: accessToken
        }),
        { method: "POST" }
      );

      const publishData = await publishResponse.json();
      return { success: true, id: publishData.id };
    } catch (e) {
      log.error("[ThreadsService] Reply failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Get User Threads
   */
  static async getThreads(userId: string, accessToken: string) {
    try {
      const response = await fetch(
        `${THREADS_API_URL}/${userId}/threads?` +
        new URLSearchParams({
          fields: "id,text,media_url,timestamp",
          access_token: accessToken
        })
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to fetch threads");

      return { success: true, data: data.data };
    } catch (e) {
      log.error("[ThreadsService] Get threads failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }
  /**
   * Get Threads User Profile (Health Check)
   */
  static async getUserProfile(accessToken: string) {
    try {
      const response = await fetch(
        `${THREADS_API_URL}/me?` +
        new URLSearchParams({
          fields: "id,username,name",
          access_token: accessToken
        })
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to fetch threads profile");

      return { success: true, data };
    } catch (e) {
      log.error("[ThreadsService] Get profile failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }
}
