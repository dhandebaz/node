import apiClient from "./client";
import { Message } from "@/types";

export const messagesApi = {
  getMessages: async (listingId?: string, channel?: string): Promise<Message[]> => {
    const response = await apiClient.get("/messages", {
      params: { listingId, channel },
    });
    return response.data;
  },

  sendMessage: async (listingId: string, guestId: string, content: string): Promise<Message> => {
    const response = await apiClient.post("/messages/send", { listingId, guestId, content });
    return response.data;
  },

  sendAiReply: async (messageId: string): Promise<Message> => {
    const response = await apiClient.post("/messages/ai-reply", { messageId });
    return response.data;
  },

  sendGuestIdRequest: async (payload: {
    bookingId: string;
    idType: string;
    message?: string | null;
  }): Promise<{ bookingId: string; uploadUrl: string }> => {
    const response = await apiClient.post("/guest-id/request", payload);
    return response.data;
  },

  getGuestId: async (bookingId: string) => {
    const response = await apiClient.get(`/guest-id/${bookingId}`);
    return response.data;
  },

  approveGuestId: async (guestId: string) => {
    const response = await apiClient.post(`/guest-id/approve/${guestId}`);
    return response.data;
  },

  rejectGuestId: async (guestId: string, reason: string) => {
    const response = await apiClient.post(`/guest-id/reject/${guestId}`, { reason });
    return response.data;
  }
};
