import apiClient from './client';
import { Guest } from '@/types';

export const guestsApi = {
  getGuest: async (id: string): Promise<Guest> => {
    const response = await apiClient.get(`/guests/${id}`);
    return response.data;
  },

  uploadId: async (guestId: string, file: File): Promise<Guest> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/guests/${guestId}/upload-id`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
