export interface Host {
  id: string;
  name: string;
  email: string;
  address: string;
  kycStatus: 'pending' | 'verified' | 'rejected' | 'none';
  walletBalance: number;
  businessName?: string;
}

export type ListingStatus = "active" | "incomplete";
export type ListingType = "Apartment" | "Villa" | "Homestay" | "Guest House";
export type ListingPlatform = "airbnb" | "booking" | "mmt";
export type ListingIntegrationStatus = "connected" | "not_connected" | "error" | "never_synced";

export interface Listing {
  id: string;
  userId: string;
  name: string;
  city: string;
  type: ListingType;
  timezone: string;
  status: ListingStatus;
  createdAt?: string;
  internalNotes?: string | null;
  platformsConnected?: ListingPlatform[];
  calendarSyncStatus?: ListingIntegrationStatus;
  nodebaseIcalUrl?: string;
}

export interface ListingIntegration {
  listingId: string;
  platform: ListingPlatform;
  externalIcalUrl: string | null;
  lastSyncedAt: string | null;
  status: ListingIntegrationStatus;
}

export interface ListingCalendar {
  listingId: string;
  nodebaseIcalUrl: string;
}

export type BookingStatus =
  | "draft"
  | "payment_pending"
  | "confirmed"
  | "cancelled"
  | "refunded"
  | "blocked"
  | "pending";

export type IdStatus =
  | "not_requested"
  | "requested"
  | "submitted"
  | "approved"
  | "rejected";

export interface Booking {
  id: string;
  listingId: string;
  guestId: string;
  guestName?: string;
  guestContact?: string | null;
  startDate: string;
  endDate: string;
  amount?: number | null;
  status: BookingStatus;
  idStatus?: IdStatus;
  source: "nodebase" | "airbnb" | "booking" | "mmt" | "direct";
  paymentId?: string | null;
  createdAt?: string;
}

export interface BookingRecord {
  id: string;
  listing_id: string;
  guest_name: string;
  guest_contact: string | null;
  check_in: string;
  check_out: string;
  amount: number;
  status: BookingStatus;
  id_status?: IdStatus | null;
  payment_id: string | null;
  created_at: string;
  source?: string | null;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "refunded";

export interface PaymentRecord {
  id: string;
  booking_id: string;
  provider: "razorpay";
  amount: number;
  status: PaymentStatus;
  payment_link: string;
  paid_at: string | null;
}

export interface GuestIdRecord {
  id: string;
  booking_id: string;
  guest_name: string;
  id_type: "aadhaar" | "passport" | "driving_license" | "voter_id" | "any";
  status: IdStatus;
  uploaded_at: string | null;
  reviewed_at: string | null;
  front_image_path: string | null;
  back_image_path: string | null;
  rejection_reason: string | null;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  channel: 'airbnb' | 'booking' | 'direct' | 'whatsapp';
  idVerificationStatus: 'pending' | 'verified' | 'rejected' | 'none';
}

export interface Message {
  id: string;
  guestId: string;
  guestName?: string; // Optional guest name for UI display
  listingId: string;
  channel: 'airbnb' | 'booking' | 'whatsapp' | 'sms';
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string; // ISO Date string
  read: boolean;
}

export interface WalletTransaction {
  id: string;
  hostId: string;
  type: 'debit' | 'credit';
  amount: number;
  reason: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Integration {
  id: string;
  userId: string;
  provider: 'google' | 'airbnb' | 'booking' | 'instagram' | 'whatsapp';
  status: 'connected' | 'expired' | 'error';
  lastSync?: string;
  expiresAt?: string;
  errorCode?: string;
  metadata?: Record<string, any>;
}
