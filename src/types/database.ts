import type { AITone } from "@/lib/ai/config";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ==========================================
// Core User Types
// ==========================================

export interface DBUser {
  id: string;
  phone: string;
  email?: string;
  full_name?: string;
  role: string;
  status: string;
  kyc_status: string;
  onboarding_status?: string;
  subscription_plan?: string;
  business_type?: string;
  created_at: string;
  updated_at?: string;
  metadata: UserMetadataJSON | null;
  // Relations (joined)
  profiles: DBProfile[] | DBProfile | null;
  kaisa_accounts: DBKaisaAccount[] | DBKaisaAccount | null;
  nodes: DBNode[];
  listings: DBListing[];
  accounts: DBAccount[] | DBAccount | null;
}

export interface UserMetadataJSON {
  tags?: string[];
  notes?: string[];
  lastActivity?: string;
  kycDocuments?: KYCDocumentJSON[];
  [key: string]: unknown;
}

export interface KYCDocumentJSON {
  type: string;
  url: string;
  status: string;
  uploadedAt: string;
}

export interface DBProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  business_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface DBKaisaAccount {
  id: string;
  user_id: string;
  status: string;
  plan_id?: string;
  business_type?: string;
  tenant_id?: string;
  active_modules?: string[];
  role?: string;
  created_at: string;
  updated_at?: string;
}

export interface DBAccount {
  id: string;
  user_id: string;
  product_type: "ai_employee" | "space";
  onboarding_status: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

// ==========================================
// Multi-Tenancy Types
// ==========================================

export interface DBTenant {
  id: string;
  name: string;
  business_name?: string | null;
  owner_user_id: string | null;
  business_type?: string | null;
  status?: string | null;
  early_access?: boolean | null;
  kyc_status?: "not_started" | "pending" | "verified" | "rejected" | null;
  pan_number?: string | null;
  aadhaar_number?: string | null;
  gstin?: string | null;
  business_registration_number?: string | null;
  kyc_verified_at?: string | null;
  // Control flags
  is_ai_enabled?: boolean | null;
  is_messaging_enabled?: boolean | null;
  is_bookings_enabled?: boolean | null;
  is_wallet_enabled?: boolean | null;
  is_memory_enabled?: boolean | null;
  is_branding_enabled?: boolean | null;
  subscription_plan?: string | null;
  // Optional extended fields
  address?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
  tax_id?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  timezone?: string | null;
  username?: string | null;
  property_count?: number | null;
  platforms?: string[] | null;
  kyc_document_path?: string | null;
  kyc_extracted_data?: Json | null;
  legal_agreement_path?: string | null;
  ai_settings?: {
    customInstructions?: string | null;
    tone?: AITone | null;
  } | null;
  created_at: string;
  updated_at?: string | null;
}

export interface DBTenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

// ==========================================
// Billing & Wallet Types
// ==========================================

export interface DBBillingPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string | null;
  interval: string | null;
  product: string | null;
  features: Json | null;
  type: string | null;
  created_at: string | null;
}

export interface DBSubscription {
  id: string;
  user_id: string | null;
  plan_id: string | null;
  status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  metadata?: any;
}

export interface DBInvoice {
  id: string;
  user_id: string | null;
  subscription_id?: string | null;
  amount: number;
  currency: string | null;
  status: string | null;
  date: string | null;
  due_date?: string | null;
  items: any | null;
  billing_details: any | null;
  created_at: string | null;
}

export interface DBPaymentMethod {
  id: string;
  user_id: string | null;
  type: string | null;
  brand?: string | null;
  last4?: string | null;
  is_default: boolean | null;
  provider_id?: string | null;
  created_at: string | null;
}

export interface DBWallet {
  id: string;
  tenant_id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface DBWalletTransaction {
  id: string;
  tenant_id: string | null;
  type: string | null;
  amount: number | null;
  description: string | null;
  metadata: Json | null;
  created_at: string | null;
}

export interface DBAiUsageEvent {
  id: string;
  tenant_id: string;
  action_type: string;
  tokens_used: number;
  credits_deducted: number;
  model: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ==========================================
// System & Control Types
// ==========================================

export interface DBSystemFlag {
  key: string;
  value: boolean;
  description?: string;
  updated_by?: string;
  updated_at: string;
}

export interface DBFeatureFlag {
  key: string;
  description?: string;
  is_global_enabled: boolean;
  tenant_overrides: string[];
  updated_at: string;
}

export interface DBFailure {
  id: string;
  tenant_id: string;
  category: string;
  source: string;
  severity: string;
  message: string;
  metadata: Json | null;
  is_active: boolean | null;
  resolved_at: string | null;
  created_at: string | null;
}

export interface DBAuditEvent {
  id: string;
  tenant_id: string | null;
  actor_id: string | null;
  actor_type: string | null;
  event_type: string | null;
  entity_id: string | null;
  entity_type: string | null;
  is_impersonated: boolean | null;
  metadata: Json;
  created_at: string | null;
}

// ==========================================
// Business Domain Types
// ==========================================

export interface DBNode {
  id: string;
  user_id: string;
  unit_value?: number;
  mou_status?: string;
  created_at: string;
}

export interface DBListing {
  id: string;
  tenant_id?: string;
  host_id?: string;
  title: string;
  description?: string;
  location?: string;
  city?: string;
  listing_type?: string;
  timezone?: string;
  base_price?: number;
  max_guests?: number;
  check_in_time?: string;
  check_out_time?: string;
  rules?: string;
  calendar_ical_url?: string;
  internal_notes?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
}

export interface DBBooking {
  id: string;
  tenant_id: string | null;
  listing_id: string | null;
  guest_id: string | null;
  amount: number | null;
  status: string | null;
  check_in: string | null;
  check_out: string | null;
  start_date: string | null;
  end_date: string | null;
  source: string | null;
  id_status: string | null;
  guest_contact: string | null;
  payment_id: string | null;
  metadata: Json | null;
  created_at: string | null;
}

export interface DBReferral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  created_at: string;
}

export interface DBSupportTicket {
  id: string;
  user_id: string;
  subject: string;
  product?: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface DBMessage {
  id: string;
  tenant_id: string | null;
  conversation_id: string | null;
  guest_id: string | null;
  listing_id: string | null;
  role: string;
  direction: string | null;
  content: string | null;
  channel: string | null;
  external_id: string | null;
  metadata: Json | null;
  created_at: string | null;
}

export interface DBCameraSession {
  id: string;
  camera_id: string;
  tenant_id: string | null;
  ingestion_id: string | null;
  frame_ref: string | null;
  size_bytes: number | null;
  status: string;
  metadata: Json | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string | null;
}

// ==========================================
// Host AI Features Types
// ==========================================

export interface DBReview {
  id: string;
  tenant_id: string | null;
  listing_id: string | null;
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
  received_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DBBlockedDate {
  id: string;
  tenant_id: string | null;
  listing_id: string | null;
  start_date: string | null;
  end_date: string | null;
  reason: string | null;
  created_at: string | null;
  created_by: string | null;
}

export interface DBTask {
  id: string;
  tenant_id: string | null;
  listing_id: string | null;
  booking_id: string | null;
  title: string;
  description: string | null;
  type: string;
  status: string;
  priority: string | null;
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DBGuestLoyalty {
  id: string;
  tenant_id: string | null;
  guest_id: string | null;
  total_bookings: number | null;
  total_spent: number | null;
  loyalty_tier: string | null;
  points: number | null;
  last_booking_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DBChannelCredential {
  id: string;
  tenant_id: string | null;
  listing_id: string | null;
  channel: string;
  credentials: Json | null;
  is_active: boolean | null;
  last_sync_at: string | null;
  sync_status: string | null;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DBTeamPermission {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  role: string;
  permissions: Json | null;
  can_manage_listings: boolean | null;
  can_manage_bookings: boolean | null;
  can_manage_payments: boolean | null;
  can_manage_guests: boolean | null;
  can_manage_integrations: boolean | null;
  can_manage_team: boolean | null;
  can_view_financials: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DBRevenueReport {
  id: string;
  tenant_id: string | null;
  report_type: string;
  date_from: string | null;
  date_to: string | null;
  listing_id: string | null;
  data: Json | null;
  file_path: string | null;
  created_at: string | null;
}

export interface DBListingAmenity {
  id: string;
  listing_id: string | null;
  amenity_category: string | null;
  amenity_name: string;
  is_available: boolean | null;
  notes: string | null;
  created_at: string | null;
}

export interface DBCalendarSyncLog {
  id: string;
  tenant_id: string | null;
  listing_id: string | null;
  sync_type: string;
  source: string;
  events_added: number | null;
  events_updated: number | null;
  events_removed: number | null;
  status: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface DBAutomatedMessage {
  id: string;
  tenant_id: string | null;
  trigger_type: string;
  subject: string | null;
  body: string | null;
  channel: string | null;
  is_active: boolean | null;
  delay_hours: number | null;
  created_at: string | null;
  updated_at: string | null;
}

