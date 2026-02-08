import apiClient from "./client";
import { WalletTransaction } from "@/types";

export const paymentsApi = {
  createPaymentLink: async (payload: {
    listingId: string;
    guestName: string;
    guestPhone?: string | null;
    guestEmail?: string | null;
    amount: number;
    checkIn: string;
    checkOut: string;
    notes?: string | null;
  }): Promise<{ bookingId: string; paymentId: string; paymentLink: string }> => {
    const response = await apiClient.post("/payments/create-link", payload);
    return response.data;
  },
  
  getPaymentSetup: async (): Promise<{ status: string; onboardingUrl: string | null }> => {
    const response = await apiClient.get("/payments/setup");
    return response.data;
  },

  startPaymentSetup: async (): Promise<{ status: string; onboardingUrl: string | null }> => {
    const response = await apiClient.post("/payments/setup", { action: "start" });
    return response.data;
  },

  completePaymentSetup: async (): Promise<{ status: string; onboardingUrl: string | null }> => {
    const response = await apiClient.post("/payments/setup", { action: "complete" });
    return response.data;
  },

  getWalletBalance: async (): Promise<{ balance: number }> => {
    const response = await apiClient.get("/wallet");
    return response.data;
  },

  getTransactions: async (): Promise<WalletTransaction[]> => {
    const response = await apiClient.get("/wallet/transactions");
    return response.data;
  },
};
