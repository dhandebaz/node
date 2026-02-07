import apiClient from './client';
import { Message } from '@/types';

export const messagesApi = {
  getMessages: async (listingId?: string, channel?: string): Promise<Message[]> => {
    const response = await apiClient.get('/messages', {
      params: { listingId, channel },
    });
    return response.data;
  },

  sendMessage: async (listingId: string, guestId: string, content: string): Promise<Message> => {
    const response = await apiClient.post('/messages/send', { listingId, guestId, content });
    return response.data;
  },

  sendAiReply: async (messageId: string): Promise<Message> => {
    const response = await apiClient.post('/messages/ai-reply', { messageId });
    return response.data;
  },
};
