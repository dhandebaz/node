-- Performance Indexes Migration

-- 1. Tenants
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON public.tenants (created_at);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON public.tenants (subscription_status);

-- 2. Users & Accounts
-- CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users (email); -- Skipped due to permissions
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_id ON public.accounts (tenant_id);

-- 3. Operational Tables (High Volume)
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    actor_type TEXT,
    actor_id UUID,
    event_type TEXT,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_id_created_at ON public.audit_events (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_events_tenant_id_created_at ON public.ai_usage_events (tenant_id, created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id_start_date ON public.bookings (tenant_id, start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);

-- 4. Messaging
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    listing_id UUID,
    guest_id UUID,
    direction TEXT,
    content TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_messages_tenant_guest ON public.messages (tenant_id, guest_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages (listing_id, guest_id);

-- 5. Billing
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    status TEXT,
    plan_id TEXT,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    amount NUMERIC,
    status TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id_date ON public.invoices (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_tenant_id ON public.wallet_transactions (tenant_id, created_at DESC);
