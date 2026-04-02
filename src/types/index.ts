import type { AITone } from "@/lib/ai/config";
import { Json } from "./database";

export interface Tenant {
  id: string;
  name: string;
  ownerUserId: string | null;
  createdAt: string;
  businessType?: BusinessType | null;
  earlyAccess?: boolean | null;
  is_memory_enabled?: boolean | null;
  is_branding_enabled?: boolean | null;
  is_ai_enabled?: boolean | null;
  kyc_status?: "not_started" | "pending" | "verified" | "rejected" | null;
  pan_number?: string | null;
  aadhaar_number?: string | null;
  kyc_verified_at?: string | null;
  address?: string | null;
  tax_id?: string | null;
  phone?: string | null;
  timezone?: string | null;
  username?: string | null;
  ai_settings?: {
    customInstructions?: string | null;
    tone?: AITone | null;
  } | null;
  business_qr_url?: string;
  upi_id?: string;
}

export type BusinessType =
  | "airbnb_host"
  | "kirana_store"
  | "doctor_clinic"
  | "thrift_store";

export interface TenantUser {
  id: string;
  tenantId: string;
  userId: string;
  role: "owner" | "admin" | "staff";
}

export interface Host {
  id: string;
  name: string;
  email: string;
  address: string;
  kycStatus: "pending" | "verified" | "rejected" | "none";
  walletBalance: number;
  businessName?: string;
}

export type ListingStatus = "active" | "incomplete";
export type ListingType = "Apartment" | "Villa" | "Homestay" | "Guest House";
export type ListingPlatform = "airbnb" | "booking" | "mmt";
export type ListingIntegrationStatus =
  | "connected"
  | "not_connected"
  | "error"
  | "never_synced";

export interface Listing {
  id: string;
  tenantId: string; // Multi-tenancy
  userId: string;
  name: string;
  city: string;
  address?: string | null;
  type: ListingType;
  timezone: string;
  status: ListingStatus;
  createdAt?: string;
  description?: string | null;
  images?: string[];
  amenities?: string[];
  basePrice?: number | null;
  maxGuests?: number | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  rules?: string | null;
  internalNotes?: string | null;
  platformsConnected?: ListingPlatform[];
  calendarSyncStatus?: ListingIntegrationStatus;
  nodebaseIcalUrl?: string;
}

export interface ListingIntegration {
  listingId: string;
  tenantId?: string; // Multi-tenancy (optional if implied by listingId, but strictly required by DB)
  platform: ListingPlatform;
  externalIcalUrl: string | null;
  lastSyncedAt: string | null;
  status: ListingIntegrationStatus;
  errorMessage?: string | null;
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
  tenantId: string; // Multi-tenancy
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
  tenant_id: string; // Multi-tenancy
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

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "refunded";

export interface PaymentRecord {
  id: string;
  tenant_id: string; // Multi-tenancy
  booking_id: string;
  provider: "razorpay";
  amount: number;
  status: PaymentStatus;
  payment_link: string;
  paid_at: string | null;
}

export interface GuestIdRecord {
  id: string;
  tenant_id: string; // Multi-tenancy
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
  tenantId: string; // Multi-tenancy
  name: string;
  phone: string;
  channel:
    | "airbnb"
    | "booking"
    | "direct"
    | "whatsapp"
    | "instagram"
    | "messenger"
    | "web";
  idVerificationStatus: "pending" | "verified" | "rejected" | "none";
  ai_paused?: boolean;
}

export interface Message {
  id: string;
  tenantId: string; // Multi-tenancy
  guestId: string;
  guestName?: string; // Optional guest name for UI display
  listingId: string;
  channel:
    | "airbnb"
    | "booking"
    | "whatsapp"
    | "sms"
    | "instagram"
    | "messenger"
    | "web";
  direction: "inbound" | "outbound";
  content: string;
  timestamp: string; // ISO Date string
  read: boolean;
}

export interface WalletTransaction {
  id: string;
  tenant_id: string | null;
  amount: number | null;
  type: string | null;
  description?: string | null;
  metadata?: Json | null;
  created_at: string | null;
}

export interface BillingPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string | null;
  interval: string | null;
  product: string | null;
  features: Json;
  type: string | null;
  created_at: string | null;
}

export interface Integration {
  id: string;
  tenantId: string; // Multi-tenancy
  userId: string;
  provider:
    | "google"
    | "airbnb"
    | "booking"
    | "instagram"
    | "whatsapp"
    | "facebook"
    | "web";
  status: "connected" | "expired" | "error" | "active";
  lastSync?: string;
  expiresAt?: string;
  errorCode?: string;
  metadata?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
}

// ==========================================
// Host AI Types
// ==========================================

export interface Review {
  id: string;
  tenant_id: string;
  listing_id: string;
  booking_id: string | null;
  guest_id: string | null;
  external_id: string | null;
  platform: "airbnb" | "booking" | "mmt" | "google" | "direct";
  rating: number;
  title: string | null;
  content: string | null;
  response_text: string | null;
  responded_at: string | null;
  is_public: boolean;
  received_at: string;
  created_at?: string;
}

export interface Task {
  id: string;
  tenant_id: string;
  listing_id: string;
  booking_id: string | null;
  title: string;
  description: string | null;
  type: "cleaning" | "maintenance" | "inspection" | "checkin" | "checkout" | "general";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  assigned_to: string | null;
  due_date: string;
  completed_at: string | null;
  created_at: string;
}

export interface BlockedDate {
  id: string;
  tenant_id: string;
  listing_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

export interface GuestLoyalty {
  id: string;
  tenant_id: string;
  guest_id: string;
  guest_name?: string;
  guest_phone?: string;
  total_bookings: number;
  total_spent: number;
  loyalty_tier: "bronze" | "silver" | "gold" | "platinum";
  points: number;
  last_booking_at: string | null;
}

export interface ChannelCredential {
  id: string;
  tenant_id: string;
  listing_id: string;
  channel: "airbnb" | "booking" | "mmt" | "google" | "Vrbo" | "expedia";
  credentials: Record<string, unknown> | null;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: "idle" | "syncing" | "success" | "error";
  error_message: string | null;
}

export interface ListingAmenity {
  id: string;
  listing_id: string;
  amenity_category: string;
  amenity_name: string;
  is_available: boolean;
  notes: string | null;
}

export interface TeamPermission {
  id: string;
  tenant_id: string;
  user_id: string;
  role: "owner" | "admin" | "manager" | "staff" | "viewer";
  permissions: Record<string, unknown>;
  can_manage_listings: boolean;
  can_manage_bookings: boolean;
  can_manage_payments: boolean;
  can_manage_guests: boolean;
  can_manage_integrations: boolean;
  can_manage_team: boolean;
  can_view_financials: boolean;
}
