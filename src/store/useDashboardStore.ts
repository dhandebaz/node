import { create } from 'zustand';
import { Listing, Booking, Message, WalletTransaction } from '@/types';
import { listingsApi } from '@/lib/api/listings';
import { messagesApi } from '@/lib/api/messages';
import { paymentsApi } from '@/lib/api/payments';

interface DashboardState {
  listings: Listing[];
  bookings: Booking[];
  messages: Message[];
  walletBalance: number;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;
  selectedListingId: string | null;

  fetchDashboardData: () => Promise<void>;
  setSelectedListingId: (id: string) => void;
  fetchCalendar: (listingId: string, range: { start: string; end: string }) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  listings: [],
  bookings: [],
  messages: [],
  walletBalance: 0,
  transactions: [],
  isLoading: false,
  error: null,
  selectedListingId: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [listings, messages, wallet, transactions] = await Promise.all([
        listingsApi.getListings(),
        messagesApi.getMessages(),
        paymentsApi.getWalletBalance(),
        paymentsApi.getTransactions(),
      ]);

      set({
        listings,
        messages,
        walletBalance: wallet.balance,
        transactions,
        isLoading: false,
        selectedListingId: listings.length > 0 ? listings[0].id : null,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setSelectedListingId: (id: string) => {
    set({ selectedListingId: id });
  },

  fetchCalendar: async (listingId: string, range: { start: string; end: string }) => {
    // Don't set global loading here to avoid flickering the whole dashboard,
    // could add a specific loading state for calendar if needed.
    try {
      const bookings = await listingsApi.getCalendar(listingId, range);
      set({ bookings });
    } catch (error) {
      console.error('Failed to fetch calendar', error);
    }
  },
}));
