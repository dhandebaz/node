import apiClient from './client';
import { Listing, Booking } from '@/types';

export const listingsApi = {
  getListings: async (): Promise<Listing[]> => {
    const response = await apiClient.get('/listings');
    return response.data;
  },

  createListing: async (listing: Omit<Listing, 'id'>): Promise<Listing> => {
    const response = await apiClient.post('/listings', listing);
    return response.data;
  },

  getCalendar: async (listingId: string, range: { start: string; end: string }): Promise<Booking[]> => {
    const response = await apiClient.get('/calendar', {
      params: { listingId, range: JSON.stringify(range) },
    });
    return response.data;
  },

  blockCalendar: async (listingId: string, dates: { start: string; end: string }): Promise<Booking> => {
    const response = await apiClient.post('/calendar/block', { listingId, dates });
    return response.data;
  },

  getIcalUrl: async (listingId: string): Promise<{ url: string }> => {
    const response = await apiClient.get(`/calendar/ical/${listingId}`);
    return response.data;
  },
};
