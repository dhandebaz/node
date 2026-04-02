import apiClient from './client';

export interface Review {
  id: string;
  tenant_id: string;
  listing_id: string;
  booking_id: string | null;
  guest_id: string | null;
  external_id: string | null;
  platform: string;
  rating: number;
  title: string | null;
  content: string | null;
  response_text: string | null;
  responded_at: string | null;
  is_public: boolean | null;
  received_at: string;
}

export interface CreateReviewPayload {
  listing_id: string;
  booking_id?: string;
  guest_id?: string;
  platform: string;
  rating: number;
  title?: string;
  content?: string;
}

export const reviewsApi = {
  getReviews: async (tenantId: string, listingId?: string, platform?: string): Promise<Review[]> => {
    let url = `/reviews?tenant_id=${tenantId}`;
    if (listingId) url += `&listing_id=${listingId}`;
    if (platform) url += `&platform=${platform}`;
    const response = await apiClient.get(url);
    return response.data.reviews || [];
  },

  createReview: async (payload: CreateReviewPayload): Promise<Review> => {
    const response = await apiClient.post('/reviews', payload);
    return response.data.review;
  },

  respondToReview: async (reviewId: string, responseText: string): Promise<Review> => {
    const response = await apiClient.post(`/reviews/${reviewId}/respond`, { response_text: responseText });
    return response.data.review;
  },
};