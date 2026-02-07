import apiClient from './client';
import { Host } from '@/types';

export const authApi = {
  loginWithGoogle: async (): Promise<{ host: Host; token: string }> => {
    const response = await apiClient.post('/auth/google');
    return response.data;
  },

  getCurrentHost: async (): Promise<Host> => {
    const response = await apiClient.get('/host/me');
    return response.data;
  },

  updateSettings: async (settings: Partial<Host>): Promise<Host> => {
    const response = await apiClient.post('/host/settings', settings);
    return response.data;
  },

  submitKyc: async (data: FormData): Promise<Host> => {
    const response = await apiClient.post('/host/kyc', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
