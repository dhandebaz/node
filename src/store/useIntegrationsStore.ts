import { create } from 'zustand';
import { integrationsApi, Integration } from '@/lib/api/integrations';

interface IntegrationsState {
  integrations: Integration[];
  loading: boolean;
  error: string | null;
  fetchIntegrations: () => Promise<void>;
  connectIntegration: (id: string) => Promise<void>;
  disconnectIntegration: (id: string) => Promise<void>;
}

export const useIntegrationsStore = create<IntegrationsState>((set, get) => ({
  integrations: [],
  loading: false,
  error: null,

  fetchIntegrations: async () => {
    set({ loading: true, error: null });
    try {
      const integrations = await integrationsApi.getIntegrations();
      set({ integrations, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch integrations', loading: false });
    }
  },

  connectIntegration: async (id: string) => {
    try {
      // Optimistic update or wait for result? Let's wait for result to be safe
      const updatedIntegration = await integrationsApi.connect(id);
      set(state => ({
        integrations: state.integrations.map(i => 
          i.id === id ? { ...i, status: 'connected', lastSync: 'Just now' } : i
        )
      }));
    } catch (err) {
      set({ error: 'Failed to connect integration' });
    }
  },

  disconnectIntegration: async (id: string) => {
    try {
      await integrationsApi.disconnect(id);
      set(state => ({
        integrations: state.integrations.map(i => 
          i.id === id ? { ...i, status: 'disconnected', lastSync: undefined } : i
        )
      }));
    } catch (err) {
      set({ error: 'Failed to disconnect integration' });
    }
  }
}));
