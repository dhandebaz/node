import apiClient from './client';

export interface VerificationRequest {
  guestId: string;
  bookingId: string;
  documentType: 'passport' | 'id_card' | 'driving_license';
  frontImage: File;
  backImage?: File;
}

export interface VerificationResult {
  id: string;
  guestId: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  details?: any;
}

export const verificationApi = {
  uploadId: async (data: VerificationRequest): Promise<VerificationResult> => {
    const formData = new FormData();
    formData.append('guestId', data.guestId);
    formData.append('bookingId', data.bookingId);
    formData.append('documentType', data.documentType);
    formData.append('frontImage', data.frontImage);
    if (data.backImage) {
      formData.append('backImage', data.backImage);
    }

    const response = await apiClient.post(`/guests/${data.guestId}/upload-id`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getStatus: async (guestId: string): Promise<VerificationResult> => {
    const response = await apiClient.get(`/guests/${guestId}/verification-status`);
    return response.data;
  },
};
