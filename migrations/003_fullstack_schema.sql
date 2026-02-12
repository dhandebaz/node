-- Migration 003: Fullstack Schema (Space, Kaisa, Analytics)

-- 1. Common Tables for Analytics & Billing

-- We assume public.users exists and mirrors auth.users or is the main user table.
-- If not, these references should be to auth.users, but Supabase recommends a public profiles table.
-- Based on userService.ts, 'users' table exists.

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Mapping tenant_id to user_id
    guest_id UUID, -- distinct guest identifier
    amount NUMERIC DEFAULT 0,
    source TEXT, -- 'direct', 'ota', etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT, -- 'ai_reply', 'subscription', 'topup'
    amount NUMERIC DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id),
    referred_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending', -- 'pending', 'rewarded'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Audit Events (Generic)
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID, -- nullable for system events
    actor_type TEXT, -- 'admin', 'user', 'system'
    actor_id UUID,
    event_type TEXT,
    entity_type TEXT,
    entity_id UUID, -- nullable
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Kaisa Specific Tables

CREATE TABLE IF NOT EXISTS public.kaisa_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    intent TEXT,
    status TEXT DEFAULT 'pending',
    module TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.kaisa_credits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC DEFAULT 0,
    monthly_limit NUMERIC DEFAULT 1000,
    used_this_month NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Space Service Tables

CREATE TABLE IF NOT EXISTS public.space_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT, -- 'Shared', 'Dedicated', 'CDN'
    status TEXT DEFAULT 'active',
    plan_name TEXT,
    datacenter_id TEXT,
    limits JSONB, -- { storageGB, bandwidthGB, vCPU, ramGB, dedicatedIP }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.space_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.space_services(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    domain TEXT,
    name TEXT,
    type TEXT, -- 'static', 'nodejs'
    status TEXT DEFAULT 'active',
    ssl_enabled BOOLEAN DEFAULT false,
    last_backup TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.space_dns_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.space_projects(id) ON DELETE CASCADE,
    type TEXT, -- 'A', 'CNAME', 'MX'
    name TEXT,
    value TEXT,
    ttl INTEGER DEFAULT 3600,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaisa_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaisa_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_dns_records ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Bookings: Tenants can view their bookings
CREATE POLICY "Tenants can view own bookings" ON public.bookings
    FOR SELECT USING (tenant_id = auth.uid());

-- Wallet Transactions: Tenants can view own transactions
CREATE POLICY "Tenants can view own wallet transactions" ON public.wallet_transactions
    FOR SELECT USING (tenant_id = auth.uid());

-- Audit Events: Admins can view all, Users can view their own
CREATE POLICY "Admins can view all audit events" ON public.audit_events
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role = 'admin')
    );
CREATE POLICY "Users can view own audit events" ON public.audit_events
    FOR SELECT USING (actor_id = auth.uid() OR entity_id = auth.uid());

-- Kaisa Tasks: Users can view/create own tasks
CREATE POLICY "Users can view own tasks" ON public.kaisa_tasks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tasks" ON public.kaisa_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kaisa Credits: Users can view own credits
CREATE POLICY "Users can view own credits" ON public.kaisa_credits
    FOR SELECT USING (auth.uid() = user_id);

-- Space Services: Users can view own services
CREATE POLICY "Users can view own space services" ON public.space_services
    FOR SELECT USING (auth.uid() = user_id);

-- Space Projects: Users can view own projects
CREATE POLICY "Users can view own space projects" ON public.space_projects
    FOR SELECT USING (auth.uid() = user_id);

-- Space DNS: Users can view own DNS
CREATE POLICY "Users can view own dns" ON public.space_dns_records
    FOR SELECT USING (
        exists (select 1 from public.space_projects where id = space_dns_records.project_id and user_id = auth.uid())
    );
