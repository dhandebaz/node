import apiClient from "./client";
import { Message } from "@/types";

export const messagesApi = {
  getMessages: async (listingId?: string, channel?: string): Promise<Message[]> => {
    const response = await apiClient.get("/messages", {
      params: { listingId, channel },
    });
    return response.data?.messages ?? response.data ?? [];
  },

  sendMessage: async (
    conversationId: string,
    content: string,
    senderType: "host" | "ai" = "host"
  ): Promise<{ message: any }> => {
    const response = await apiClient.post("/api/inbox/send", {
      conversationId,
      content,
      senderType,
    });
    return response.data;
  },

  sendAiReply: async (messageId: string): Promise<{ reply: string }> => {
    const response = await apiClient.post("/api/messages/ai-reply", { messageId });
    return response.data;
  },

  sendGuestIdRequest: async (payload: {
    bookingId: string;
    idType: string;
    message?: string | null;
  }): Promise<{ bookingId: string; uploadUrl: string }> => {
    const response = await apiClient.post("/api/guest-id/request", payload);
    return response.data;
  },

  getGuestId: async (bookingId: string) => {
    const response = await apiClient.get(`/api/guest-id/${bookingId}`);
    return response.data;
  },

  approveGuestId: async (guestId: string) => {
    const response = await apiClient.post(`/api/guest-id/approve/${guestId}`);
    return response.data;
  },

  rejectGuestId: async (guestId: string, reason: string) => {
    const response = await apiClient.post(`/api/guest-id/reject/${guestId}`, { reason });
    return response.data;
  }
};
