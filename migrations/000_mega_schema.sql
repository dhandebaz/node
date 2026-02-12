-- 000_mega_schema.sql
-- FULL RESET AND SCHEMA SETUP
-- Run this in Supabase SQL Editor to reset and rebuild the database.

-- ==========================================
-- 1. CLEANUP (Drop existing tables)
-- ==========================================
DROP TABLE IF EXISTS public.investor_reports CASCADE;
DROP TABLE IF EXISTS public.investor_documents CASCADE;
DROP TABLE IF EXISTS public.support_ticket_messages CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.billing_plans CASCADE;
DROP TABLE IF EXISTS public.listing_calendars CASCADE;
DROP TABLE IF EXISTS public.listing_integrations CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.nodes CASCADE;
DROP TABLE IF EXISTS public.kaisa_accounts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.space_dns_records CASCADE;
DROP TABLE IF EXISTS public.space_projects CASCADE;
DROP TABLE IF EXISTS public.space_services CASCADE;
DROP TABLE IF EXISTS public.kaisa_credits CASCADE;
DROP TABLE IF EXISTS public.kaisa_tasks CASCADE;
DROP TABLE IF EXISTS public.audit_events CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.admin_audit_logs CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE; -- OPTIONAL: Uncomment if you want to rebuild the public.users mirror

-- ==========================================
-- 2. CORE TABLES (Users & Settings)
-- ==========================================

-- Ensure public.users exists (Syncs with auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'admin', 'manager'
    status TEXT DEFAULT 'active',
    metadata JSONB DEFAULT '{"tags": [], "notes": []}'::jsonb,
    subscription_plan TEXT DEFAULT 'starter',
    business_type TEXT DEFAULT 'airbnb_host',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES public.users(id)
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view system settings" ON public.system_settings;
CREATE POLICY "Admins can view system settings" ON public.system_settings
  FOR SELECT USING (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
CREATE POLICY "Admins can update system settings" ON public.system_settings
  FOR ALL USING (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ==========================================
-- 3. AUDIT LOGGING
-- ==========================================

-- Legacy Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.users(id),
    action_type TEXT,
    details TEXT,
    target_resource TEXT DEFAULT 'user',
    target_resource_id UUID,
    previous_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- New Generic Audit Events
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

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all audit events" ON public.audit_events;
CREATE POLICY "Admins can view all audit events" ON public.audit_events
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role = 'admin')
    );

DROP POLICY IF EXISTS "Users can view own audit events" ON public.audit_events;
CREATE POLICY "Users can view own audit events" ON public.audit_events
    FOR SELECT USING (actor_id = auth.uid() OR entity_id = auth.uid());

-- ==========================================
-- 4. CORE BUSINESS TABLES (Bookings, Wallet, Referrals)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_id UUID,
    amount NUMERIC DEFAULT 0,
    source TEXT,
    status TEXT DEFAULT 'confirmed',
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT,
    amount NUMERIC DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id),
    referred_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenants can view own bookings" ON public.bookings;
CREATE POLICY "Tenants can view own bookings" ON public.bookings FOR SELECT USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Tenants can view own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Tenants can view own wallet transactions" ON public.wallet_transactions FOR SELECT USING (tenant_id = auth.uid());

-- ==========================================
-- 5. KAISA SERVICE
-- ==========================================

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

CREATE TABLE IF NOT EXISTS public.kaisa_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    plan_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

ALTER TABLE public.kaisa_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaisa_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaisa_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tasks" ON public.kaisa_tasks;
CREATE POLICY "Users can view own tasks" ON public.kaisa_tasks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own tasks" ON public.kaisa_tasks;
CREATE POLICY "Users can create own tasks" ON public.kaisa_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own credits" ON public.kaisa_credits;
CREATE POLICY "Users can view own credits" ON public.kaisa_credits FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own kaisa account" ON public.kaisa_accounts;
CREATE POLICY "Users can view own kaisa account" ON public.kaisa_accounts FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- 6. SPACE SERVICE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.space_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT,
    status TEXT DEFAULT 'active',
    plan_name TEXT,
    datacenter_id TEXT,
    limits JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.space_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.space_services(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    domain TEXT,
    name TEXT,
    type TEXT,
    status TEXT DEFAULT 'active',
    ssl_enabled BOOLEAN DEFAULT false,
    last_backup TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.space_dns_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.space_projects(id) ON DELETE CASCADE,
    type TEXT,
    name TEXT,
    value TEXT,
    ttl INTEGER DEFAULT 3600,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.space_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_dns_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own space services" ON public.space_services;
CREATE POLICY "Users can view own space services" ON public.space_services FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own space projects" ON public.space_projects;
CREATE POLICY "Users can view own space projects" ON public.space_projects FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own dns" ON public.space_dns_records;
CREATE POLICY "Users can view own dns" ON public.space_dns_records FOR SELECT USING (
    exists (select 1 from public.space_projects where id = space_dns_records.project_id and user_id = auth.uid())
);

-- ==========================================
-- 7. NODE SERVICE (Investment)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    unit_value NUMERIC DEFAULT 0,
    mou_status TEXT DEFAULT 'draft',
    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own nodes" ON public.nodes;
CREATE POLICY "Users can view own nodes" ON public.nodes FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- 8. LISTINGS & MESSAGES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    business_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID,
    tenant_id UUID REFERENCES auth.users(id),
    guest_id UUID,
    role TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    host_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    city TEXT,
    listing_type TEXT DEFAULT 'Homestay',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    base_price NUMERIC DEFAULT 0,
    max_guests INTEGER DEFAULT 1,
    check_in_time TEXT,
    check_out_time TEXT,
    rules TEXT,
    calendar_ical_url TEXT,
    internal_notes TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.listing_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT,
    external_ical_url TEXT,
    last_synced_at TIMESTAMPTZ,
    status TEXT DEFAULT 'connected',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.listing_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    nodebase_ical_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_calendars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
CREATE POLICY "Users can insert own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "Users can view own listings" ON public.listings;
CREATE POLICY "Users can view own listings" ON public.listings FOR SELECT USING (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "Users can insert own listings" ON public.listings;
CREATE POLICY "Users can insert own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
CREATE POLICY "Users can delete own listings" ON public.listings FOR DELETE USING (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "Users can view own listing integrations" ON public.listing_integrations;
CREATE POLICY "Users can view own listing integrations" ON public.listing_integrations FOR SELECT USING (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "Users can manage own listing integrations" ON public.listing_integrations;
CREATE POLICY "Users can manage own listing integrations" ON public.listing_integrations FOR ALL USING (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "Users can view own listing calendars" ON public.listing_calendars;
CREATE POLICY "Users can view own listing calendars" ON public.listing_calendars FOR SELECT USING (
    exists (select 1 from public.listings where id = listing_calendars.listing_id and tenant_id = auth.uid())
);

-- ==========================================
-- 9. BILLING SYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS public.billing_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    interval TEXT,
    product TEXT,
    features JSONB,
    type TEXT DEFAULT 'subscription',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Plans
INSERT INTO public.billing_plans (id, name, description, price, currency, interval, product, features, type)
VALUES 
('plan_kaisa_manager', 'Kaisa Manager', 'For individual managers', 299, 'INR', 'month', 'kaisa', '["Task Management", "Basic Modules", "Standard Support"]', 'subscription'),
('plan_kaisa_founder', 'Kaisa Co-founder', 'For growing businesses', 999, 'INR', 'month', 'kaisa', '["All Modules", "Priority Support", "Advanced Analytics", "Multi-user"]', 'subscription'),
('plan_space_shared', 'Shared Hosting', 'Reliable web hosting', 199, 'INR', 'month', 'space', '["1 Website", "10GB Storage", "Free SSL"]', 'subscription'),
('credit_kaisa_100', '100 Credits', 'Top-up for AI tasks', 100, 'INR', 'one_time', 'kaisa', '["100 Task Credits"]', 'credits')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT REFERENCES public.billing_plans(id),
    status TEXT DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id),
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'paid',
    date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    items JSONB,
    billing_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'card',
    brand TEXT,
    last4 TEXT,
    is_default BOOLEAN DEFAULT false,
    provider_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view plans" ON public.billing_plans;
CREATE POLICY "Anyone can view plans" ON public.billing_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own payment methods" ON public.payment_methods;
CREATE POLICY "Users can view own payment methods" ON public.payment_methods FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own payment methods" ON public.payment_methods;
CREATE POLICY "Users can manage own payment methods" ON public.payment_methods FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 10. INVESTOR & SUPPORT SYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    product TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID,
    sender_role TEXT DEFAULT 'user',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.investor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.investor_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    period TEXT,
    url TEXT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;
CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view messages for own tickets" ON public.support_ticket_messages;
CREATE POLICY "Users can view messages for own tickets" ON public.support_ticket_messages FOR SELECT USING (
    exists (select 1 from public.support_tickets where id = support_ticket_messages.ticket_id and user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can add messages to own tickets" ON public.support_ticket_messages;
CREATE POLICY "Users can add messages to own tickets" ON public.support_ticket_messages FOR INSERT WITH CHECK (
    exists (select 1 from public.support_tickets where id = support_ticket_messages.ticket_id and user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view own documents" ON public.investor_documents;
CREATE POLICY "Users can view own documents" ON public.investor_documents FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own reports" ON public.investor_reports;
CREATE POLICY "Users can view own reports" ON public.investor_reports FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR ALL USING (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

DROP POLICY IF EXISTS "Admins can view all messages" ON public.support_ticket_messages;
CREATE POLICY "Admins can view all messages" ON public.support_ticket_messages FOR ALL USING (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

DROP POLICY IF EXISTS "Admins can manage investor documents" ON public.investor_documents;
CREATE POLICY "Admins can manage investor documents" ON public.investor_documents FOR ALL USING (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

DROP POLICY IF EXISTS "Admins can manage investor reports" ON public.investor_reports;
CREATE POLICY "Admins can manage investor reports" ON public.investor_reports FOR ALL USING (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
