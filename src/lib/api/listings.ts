import apiClient from './client';
import { Listing, Booking, ListingIntegration, ListingCalendar } from '@/types';

export const listingsApi = {
  getListings: async (): Promise<Listing[]> => {
    const response = await apiClient.get('/listings');
    return response.data;
  },

  createListing: async (payload: {
    listing: Listing;
    integrations: ListingIntegration[];
  }): Promise<Listing> => {
    const response = await apiClient.post('/listings/create', payload);
    return response.data;
  },

  getListing: async (listingId: string): Promise<{ listing: Listing; integrations: ListingIntegration[]; calendar: ListingCalendar }> => {
    const response = await apiClient.get(`/listings/${listingId}`);
    return response.data;
  },

  updateListing: async (listingId: string, updates: Partial<Listing>): Promise<Listing> => {
    const response = await apiClient.post(`/listings/${listingId}/update`, updates);
    return response.data;
  },

  updateIntegrations: async (listingId: string, integrations: ListingIntegration[]): Promise<{
    integrations: ListingIntegration[];
  }> => {
    const response = await apiClient.post(`/listings/${listingId}/integrations`, { integrations });
    return response.data;
  },

  getCalendar: async (listingId: string, range: { start: string; end: string }): Promise<Booking[]> => {
    const response = await apiClient.get(`/listings/${listingId}/calendar`, {
      params: { start: range.start, end: range.end },
    });
    return response.data.bookings || [];
  },

  getListingCalendar: async (listingId: string): Promise<{
    calendar: ListingCalendar;
    integrations: ListingIntegration[];
    lastSyncedAt: string | null;
    status: string;
  }> => {
    const response = await apiClient.get(`/listings/${listingId}/calendar`);
    return response.data;
  },

  blockCalendar: async (listingId: string, dates: { start: string; end: string }): Promise<Booking> => {
    const response = await apiClient.post('/calendar/block', { listingId, dates });
    return response.data;
  },
};
