-- Migration 004: Billing, Listings, and Core Business Tables

-- 1. Core User Relations (Required for UserService)

-- Profiles (Extends User info)
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

-- Kaisa Accounts (Track Kaisa product status)
CREATE TABLE IF NOT EXISTS public.kaisa_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'suspended'
    plan_id TEXT, -- Reference to billing_plans
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Nodes (Investment Units)
CREATE TABLE IF NOT EXISTS public.nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    unit_value NUMERIC DEFAULT 0,
    mou_status TEXT DEFAULT 'draft', -- 'draft', 'signed', 'verified'
    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Messages (For Analytics & Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID, -- Can link to a conversation table if exists, or just group by this
    tenant_id UUID REFERENCES auth.users(id), -- Owner of the conversation
    guest_id UUID, -- External user/guest
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- 2. Listings (Matching App Route Logic)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Mapping to user
    host_id UUID REFERENCES auth.users(id), -- Usually same as tenant_id
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
    platform TEXT, -- 'airbnb', 'booking', etc.
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

-- 3. Billing System

-- Plans
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

-- Seed default plans
INSERT INTO public.billing_plans (id, name, description, price, currency, interval, product, features, type)
VALUES 
('plan_kaisa_manager', 'Kaisa Manager', 'For individual managers', 299, 'INR', 'month', 'kaisa', '["Task Management", "Basic Modules", "Standard Support"]', 'subscription'),
('plan_kaisa_founder', 'Kaisa Co-founder', 'For growing businesses', 999, 'INR', 'month', 'kaisa', '["All Modules", "Priority Support", "Advanced Analytics", "Multi-user"]', 'subscription'),
('plan_space_shared', 'Shared Hosting', 'Reliable web hosting', 199, 'INR', 'month', 'space', '["1 Website", "10GB Storage", "Free SSL"]', 'subscription'),
('credit_kaisa_100', '100 Credits', 'Top-up for AI tasks', 100, 'INR', 'one_time', 'kaisa', '["100 Task Credits"]', 'credits')
ON CONFLICT (id) DO NOTHING;

-- Subscriptions
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

-- Invoices
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

-- Payment Methods
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

-- 4. Add Columns to Users & Bookings
-- Ensure these exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'airbnb_host';

-- Improve Bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS check_in TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS check_out TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';

-- 5. RLS Policies

-- Users (Important for UserService)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
-- Allow admins to view all users (Assuming admin role check)
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kaisa Accounts
ALTER TABLE public.kaisa_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own kaisa account" ON public.kaisa_accounts FOR SELECT USING (auth.uid() = user_id);

-- Nodes
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own nodes" ON public.nodes FOR SELECT USING (auth.uid() = user_id);

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Users can insert own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = tenant_id);

-- Listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own listings" ON public.listings FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Users can insert own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = tenant_id);
CREATE POLICY "Users can delete own listings" ON public.listings FOR DELETE USING (auth.uid() = tenant_id);

-- Listing Integrations
ALTER TABLE public.listing_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own listing integrations" ON public.listing_integrations FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Users can manage own listing integrations" ON public.listing_integrations FOR ALL USING (auth.uid() = tenant_id);

-- Listing Calendars
ALTER TABLE public.listing_calendars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own listing calendars" ON public.listing_calendars FOR SELECT USING (
    exists (select 1 from public.listings where id = listing_calendars.listing_id and tenant_id = auth.uid())
);

-- Billing Plans (Public Read)
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view plans" ON public.billing_plans FOR SELECT USING (true);

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);

-- Payment Methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payment methods" ON public.payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own payment methods" ON public.payment_methods FOR ALL USING (auth.uid() = user_id);
