import apiClient from './client';

export interface ChannelCredential {
  id: string;
  tenant_id: string;
  listing_id: string;
  channel: string;
  credentials: Record<string, any> | null;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string;
  error_message: string | null;
}

export interface ConnectChannelPayload {
  listing_id: string;
  channel: string;
  credentials: Record<string, any>;
}

export const channelsApi = {
  getCredentials: async (tenantId: string, listingId?: string): Promise<ChannelCredential[]> => {
    let url = `/channel-credentials?tenant_id=${tenantId}`;
    if (listingId) url += `&listing_id=${listingId}`;
    const response = await apiClient.get(url);
    return response.data.credentials || [];
  },

  connectChannel: async (payload: ConnectChannelPayload): Promise<ChannelCredential> => {
    const response = await apiClient.post('/channel-credentials', payload);
    return response.data.credential;
  },

  disconnectChannel: async (credentialId: string): Promise<void> => {
    await apiClient.delete(`/channel-credentials/${credentialId}`);
  },

  syncChannel: async (credentialId: string): Promise<ChannelCredential> => {
    const response = await apiClient.post(`/channel-credentials/${credentialId}/sync`, {});
    return response.data.credential;
  },

  updateChannel: async (credentialId: string, updates: Partial<ChannelCredential>): Promise<ChannelCredential> => {
    const response = await apiClient.patch(`/channel-credentials/${credentialId}`, updates);
    return response.data.credential;
  },
};