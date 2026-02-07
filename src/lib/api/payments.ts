import apiClient from './client';
import { WalletTransaction } from '@/types';

export const paymentsApi = {
  sendPaymentLink: async (bookingId: string, amount: number): Promise<{ link: string }> => {
    const response = await apiClient.post('/payments/link', { bookingId, amount });
    return response.data;
  },

  getWalletBalance: async (): Promise<{ balance: number }> => {
    const response = await apiClient.get('/wallet');
    return response.data;
  },

  getTransactions: async (): Promise<WalletTransaction[]> => {
    const response = await apiClient.get('/wallet/transactions');
    return response.data;
  },
};
