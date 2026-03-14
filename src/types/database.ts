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
    product_type: 'ai_employee' | 'space';
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
    owner_user_id: string;
    business_type?: string;
    status?: string;
    early_access?: boolean;
    kyc_status?: 'not_started' | 'pending' | 'verified' | 'rejected';
    pan_number?: string;
    aadhaar_number?: string;
    kyc_verified_at?: string;
    // Control flags
    is_ai_enabled?: boolean;
    is_messaging_enabled?: boolean;
    is_bookings_enabled?: boolean;
    is_wallet_enabled?: boolean;
    is_memory_enabled?: boolean;
    is_branding_enabled?: boolean;
    subscription_plan?: string;
    // Optional extended fields
    address?: string;
    tax_id?: string;
    phone?: string;
    timezone?: string;
    username?: string;
    property_count?: number;
    platforms?: string[];
    kyc_document_path?: string;
    kyc_extracted_data?: Record<string, unknown>;
    legal_agreement_path?: string;
    created_at: string;
    updated_at?: string;
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
    description: string;
    price: number;
    currency: string;
    interval: string;
    product: string;
    features: string[];
    type: string;
    created_at: string;
}

export interface DBSubscription {
    id: string;
    user_id: string;
    plan_id: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, unknown>;
}

export interface DBInvoice {
    id: string;
    user_id: string;
    subscription_id?: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
    due_date?: string;
    items: { description: string; amount: number }[];
    billing_details: Record<string, unknown>;
    created_at: string;
}

export interface DBPaymentMethod {
    id: string;
    user_id: string;
    type: string;
    brand?: string;
    last4?: string;
    is_default: boolean;
    provider_id?: string;
    created_at: string;
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
    tenant_id: string;
    type: string;
    amount: number;
    description?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
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
    metadata?: Record<string, unknown>;
    is_active: boolean;
    resolved_at?: string;
    created_at: string;
}

export interface DBAuditEvent {
    id: string;
    tenant_id?: string;
    actor_type: string;
    actor_id?: string;
    event_type: string;
    entity_type: string;
    entity_id?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
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
    tenant_id: string;
    guest_id?: string;
    amount: number;
    source?: string;
    status: string;
    check_in?: string;
    check_out?: string;
    created_at: string;
    metadata?: Record<string, unknown>;
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
    conversation_id?: string;
    tenant_id: string;
    guest_id?: string;
    role: string;
    content?: string;
    created_at: string;
}
