export interface Host {
  id: string;
  name: string;
  email: string;
  address: string;
  kycStatus: 'pending' | 'verified' | 'rejected' | 'none';
  walletBalance: number;
  businessName?: string;
}

export interface Listing {
  id: string;
  hostId: string;
  title: string;
  location: string;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  rules: string[];
  basePrice: number;
  calendarIcalUrl?: string;
}

export interface Booking {
  id: string;
  listingId: string;
  guestId: string;
  guestName?: string; // Optional guest name for UI display
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  status: 'pending' | 'confirmed' | 'blocked' | 'cancelled';
  source: 'nodebase' | 'airbnb' | 'booking';
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
