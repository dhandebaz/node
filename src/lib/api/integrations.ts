import apiClient from './client';

export interface Integration {
  id: string;
  name: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  description: string;
}

export const integrationsApi = {
  getIntegrations: async (): Promise<Integration[]> => {
    // Mock response for now, but contract is real
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'airbnb',
            name: 'Airbnb',
            icon: '/images/integrations/airbnb.png',
            status: 'connected',
            lastSync: '2 minutes ago',
            description: 'Syncs availability, bookings, and messages in real-time.'
          },
          {
            id: 'booking',
            name: 'Booking.com',
            icon: '/images/integrations/booking.png',
            status: 'disconnected',
            description: 'Connect to sync calendar and reservations.'
          },
          {
            id: 'vrbo',
            name: 'Vrbo',
            icon: '/images/integrations/vrbo.png',
            status: 'disconnected',
            description: 'Expand your reach to vacation rental travelers.'
          }
        ]);
      }, 500);
    });
    // const response = await apiClient.get('/integrations');
    // return response.data;
  },

  connect: async (id: string): Promise<Integration> => {
    // Mock connection
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id,
                name: id === 'booking' ? 'Booking.com' : 'Vrbo',
                icon: `/images/integrations/${id}.png`,
                status: 'connected',
                lastSync: 'Just now',
                description: 'Connected successfully.'
            });
        }, 1500);
    });
    // const response = await apiClient.post(`/integrations/${id}/connect`);
    // return response.data;
  },

  disconnect: async (id: string): Promise<void> => {
    // Mock disconnect
    return new Promise((resolve) => setTimeout(resolve, 500));
    // await apiClient.post(`/integrations/${id}/disconnect`);
  }
};
