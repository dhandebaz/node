import apiClient from './client';

export interface GuestLoyalty {
  id: string;
  tenant_id: string;
  guest_id: string;
  total_bookings: number;
  total_spent: number;
  loyalty_tier: string;
  points: number;
  last_booking_at: string | null;
}

export const loyaltyApi = {
  getGuests: async (tenantId: string): Promise<GuestLoyalty[]> => {
    const response = await apiClient.get(`/loyalty?tenant_id=${tenantId}`);
    return response.data.guests || [];
  },

  updateGuestLoyalty: async (payload: {
    guest_id: string;
    loyalty_tier: string;
    points: number;
    total_bookings: number;
    total_spent: number;
  }): Promise<GuestLoyalty> => {
    const response = await apiClient.post('/loyalty', payload);
    return response.data.loyalty;
  },

  calculateTier: (totalBookings: number): string => {
    if (totalBookings >= 30) return 'platinum';
    if (totalBookings >= 15) return 'gold';
    if (totalBookings >= 5) return 'silver';
    return 'bronze';
  },

  calculatePoints: (totalSpent: number, tier: string): number => {
    const multipliers: Record<string, number> = {
      platinum: 3,
      gold: 2,
      silver: 1.5,
      bronze: 1
    };
    return Math.floor(totalSpent * (multipliers[tier] || 1));
  },
};