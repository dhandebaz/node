import { create } from 'zustand';
import { Listing, Booking, Message, WalletTransaction } from '@/types';
import { listingsApi } from '@/lib/api/listings';
import { messagesApi } from '@/lib/api/messages';
import { paymentsApi } from '@/lib/api/payments';
import { isSessionExpiredError } from '@/lib/api/errors';

interface DashboardState {
  listings: Listing[];
  bookings: Booking[];
  messages: Message[];
  walletBalance: number;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;
  selectedListingId: string | "all" | null;

  fetchDashboardData: () => Promise<void>;
  setSelectedListingId: (id: string | "all") => void;
  fetchCalendar: (listingId: string | "all", range: { start: string; end: string }) => Promise<void>;
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

      const defaultSelection = listings.length > 1 ? "all" : listings.length === 1 ? listings[0].id : null;

      set({
        listings,
        messages,
        walletBalance: wallet.balance,
        transactions,
        isLoading: false,
        selectedListingId: defaultSelection,
      });
    } catch (error) {
      const message = isSessionExpiredError(error) ? "SESSION_EXPIRED" : (error as Error).message;
      set({ error: message, isLoading: false });
    }
  },

  setSelectedListingId: (id: string | "all") => {
    set({ selectedListingId: id });
  },

  fetchCalendar: async (listingId: string | "all", range: { start: string; end: string }) => {
    // Don't set global loading here to avoid flickering the whole dashboard,
    // could add a specific loading state for calendar if needed.
    try {
      if (listingId === "all") {
        const currentListings = get().listings;
        if (currentListings.length === 0) {
          set({ bookings: [] });
          return;
        }
        const bookingsByListing = await Promise.all(
          currentListings.map((listing) => listingsApi.getCalendar(listing.id, range))
        );
        set({ bookings: bookingsByListing.flat() });
        return;
      }
      const bookings = await listingsApi.getCalendar(listingId, range);
      set({ bookings });
    } catch (error) {
      console.error('Failed to fetch calendar', error);
    }
  },
}));
