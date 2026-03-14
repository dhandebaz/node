-- Migration 006: Production Schema Alignment
-- Adds missing tables, columns, indexes, and triggers referenced by services.

-- ==========================================
-- 1. MULTI-TENANCY TABLES
-- ==========================================

-- Tenants (Referenced by controlService, subscriptionService, analyticsService, customer.ts)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    business_type TEXT DEFAULT 'airbnb_host',
    status TEXT DEFAULT 'active',
    early_access BOOLEAN DEFAULT false,
    kyc_status TEXT DEFAULT 'not_started', -- not_started, pending, verified, rejected
    pan_number TEXT,
    aadhaar_number TEXT,
    kyc_verified_at TIMESTAMPTZ,
    -- Control flags (referenced by controlService)
    is_ai_enabled BOOLEAN DEFAULT true,
    is_messaging_enabled BOOLEAN DEFAULT true,
    is_bookings_enabled BOOLEAN DEFAULT true,
    is_wallet_enabled BOOLEAN DEFAULT true,
    is_memory_enabled BOOLEAN DEFAULT false,
    is_branding_enabled BOOLEAN DEFAULT false,
    subscription_plan TEXT DEFAULT 'starter',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
CREATE POLICY "Users can view own tenant" ON public.tenants
    FOR SELECT USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all tenants" ON public.tenants;
CREATE POLICY "Admins can view all tenants" ON public.tenants
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'superadmin'))
    );

-- Tenant Users (Joint table for multi-user tenants)
CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member', -- owner, admin, member, viewer
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT tenant_users_unique UNIQUE (tenant_id, user_id)
);

ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant memberships" ON public.tenant_users;
CREATE POLICY "Users can view own tenant memberships" ON public.tenant_users
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage tenant users" ON public.tenant_users;
CREATE POLICY "Admins can manage tenant users" ON public.tenant_users
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'superadmin'))
    );

-- Accounts (Referenced by customer.ts for onboarding/product tracking)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_type TEXT DEFAULT 'ai_employee', -- ai_employee, space, node
    onboarding_status TEXT DEFAULT 'pending', -- pending, in_progress, complete
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT accounts_user_unique UNIQUE (user_id)
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own account" ON public.accounts;
CREATE POLICY "Users can view own account" ON public.accounts
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage accounts" ON public.accounts;
CREATE POLICY "Admins can manage accounts" ON public.accounts
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'superadmin'))
    );

-- ==========================================
-- 2. WALLET SYSTEM (Referenced by walletService)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    balance NUMERIC DEFAULT 0 CHECK (balance >= 0),
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT wallets_tenant_unique UNIQUE (tenant_id)
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenants can view own wallet" ON public.wallets;
CREATE POLICY "Tenants can view own wallet" ON public.wallets
    FOR SELECT USING (
        exists (select 1 from public.tenant_users where tenant_id = wallets.tenant_id and user_id = auth.uid())
    );

-- Add missing columns to wallet_transactions
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS description TEXT;

-- AI Usage Events (Referenced by walletService for tracking AI cost)
CREATE TABLE IF NOT EXISTS public.ai_usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    credits_deducted NUMERIC DEFAULT 0,
    model TEXT DEFAULT 'unknown',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenants can view own usage" ON public.ai_usage_events;
CREATE POLICY "Tenants can view own usage" ON public.ai_usage_events
    FOR SELECT USING (
        exists (select 1 from public.tenant_users where tenant_id = ai_usage_events.tenant_id and user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can view all usage" ON public.ai_usage_events;
CREATE POLICY "Admins can view all usage" ON public.ai_usage_events
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'superadmin'))
    );

-- ==========================================
-- 3. FAILURE TRACKING (Referenced by failureService)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.failures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    category TEXT NOT NULL, -- integration, payment, ai, system
    source TEXT NOT NULL, -- whatsapp, razorpay, gemini, etc.
    severity TEXT DEFAULT 'warning', -- info, warning, critical
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.failures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenants can view own failures" ON public.failures;
CREATE POLICY "Tenants can view own failures" ON public.failures
    FOR SELECT USING (
        exists (select 1 from public.tenant_users where tenant_id = failures.tenant_id and user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can manage all failures" ON public.failures;
CREATE POLICY "Admins can manage all failures" ON public.failures
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'superadmin'))
    );

-- ==========================================
-- 4. SYSTEM CONTROL TABLES (Referenced by controlService)
-- ==========================================

-- System Flags (Global Kill Switches)
CREATE TABLE IF NOT EXISTS public.system_flags (
    key TEXT PRIMARY KEY,
    value BOOLEAN DEFAULT true,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view system flags" ON public.system_flags;
CREATE POLICY "Anyone can view system flags" ON public.system_flags
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage system flags" ON public.system_flags;
CREATE POLICY "Admins can manage system flags" ON public.system_flags
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'superadmin'))
    );

-- Seed default system flags
INSERT INTO public.system_flags (key, value, description) VALUES
    ('ai_global_enabled', true, 'Enable/disable AI for all tenants'),
    ('bookings_global_enabled', true, 'Enable/disable booking creation globally'),
    ('incident_mode_enabled', false, 'Emergency mode - blocks high-risk actions'),
    ('messaging_global_enabled', true, 'Enable/disable outbound messaging'),
    ('payments_global_enabled', true, 'Enable/disable payment processing'),
    ('signups_global_enabled', true, 'Enable/disable new user signups'),
    ('sync_global_enabled', true, 'Enable/disable integration syncs')
ON CONFLICT (key) DO NOTHING;

-- Feature Flags (Per-feature toggles with tenant overrides)
CREATE TABLE IF NOT EXISTS public.feature_flags (
    key TEXT PRIMARY KEY,
    description TEXT,
    is_global_enabled BOOLEAN DEFAULT false,
    tenant_overrides TEXT[] DEFAULT '{}', -- Array of tenant IDs with access
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view feature flags" ON public.feature_flags;
CREATE POLICY "Anyone can view feature flags" ON public.feature_flags
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'superadmin'))
    );

-- ==========================================
-- 5. PERFORMANCE INDEXES
-- ==========================================

-- Hot path indexes for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_created ON public.bookings (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_wallet_txns_tenant_type ON public.wallet_transactions (tenant_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_tenant ON public.audit_events (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_type ON public.audit_events (event_type);
CREATE INDEX IF NOT EXISTS idx_messages_tenant ON public.messages (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_guest ON public.messages (guest_id);
CREATE INDEX IF NOT EXISTS idx_listings_tenant ON public.listings (tenant_id);
CREATE INDEX IF NOT EXISTS idx_failures_tenant_active ON public.failures (tenant_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_usage_tenant ON public.ai_usage_events (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON public.tenant_users (user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON public.tenant_users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON public.invoices (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals (status);

-- ==========================================
-- 6. WALLET BALANCE TRIGGER
-- ==========================================

-- Function: Recalculate wallet balance after transaction insert
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Upsert wallet with recalculated balance
    INSERT INTO public.wallets (tenant_id, balance, updated_at)
    VALUES (
        NEW.tenant_id,
        (SELECT COALESCE(SUM(amount), 0) FROM public.wallet_transactions WHERE tenant_id = NEW.tenant_id),
        NOW()
    )
    ON CONFLICT (tenant_id) 
    DO UPDATE SET 
        balance = (SELECT COALESCE(SUM(amount), 0) FROM public.wallet_transactions WHERE tenant_id = NEW.tenant_id),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Run after every wallet transaction insert
DROP TRIGGER IF EXISTS trg_update_wallet_balance ON public.wallet_transactions;
CREATE TRIGGER trg_update_wallet_balance
    AFTER INSERT ON public.wallet_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_wallet_balance();

-- ==========================================
-- 7. ADD MISSING COLUMNS TO USERS TABLE
-- ==========================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'none';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending';
