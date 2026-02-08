-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'customer',
  onboarding_status TEXT DEFAULT 'pending', -- pending, completed
  kyc_status TEXT DEFAULT 'none', -- none, pending, verified, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  business_name TEXT,
  address TEXT,
  kyc_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  CONSTRAINT users_id_key UNIQUE (user_id)
);

-- 3. Create Datacenters Table
CREATE TABLE IF NOT EXISTS public.datacenters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  total_capacity INTEGER DEFAULT 0,
  active_nodes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Nodes Table
CREATE TABLE IF NOT EXISTS public.nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  datacenter_id UUID REFERENCES public.datacenters(id) ON DELETE SET NULL,
  pool TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  mou_status TEXT DEFAULT 'draft',
  unit_value BIGINT DEFAULT 1000000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create Kaisa Accounts Table
CREATE TABLE IF NOT EXISTS public.kaisa_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active',
  credits INTEGER DEFAULT 0,
  wallet_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT kaisa_user_unique UNIQUE (user_id)
);

-- 6. Create Integrations Table (NEW)
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- google, airbnb, booking, instagram, whatsapp
  status TEXT DEFAULT 'connected', -- connected, expired, error
  access_token TEXT, -- Encrypted in application layer before storage if needed, or RLS protected
  refresh_token TEXT,
  scopes TEXT[],
  last_sync TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  error_code TEXT,
  connected_email TEXT,
  connected_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Flexible storage for provider-specific details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT integration_user_provider_unique UNIQUE (user_id, provider)
);

-- 6B. Create Google Context Table (Reserved for AI context sync)
CREATE TABLE IF NOT EXISTS public.google_context (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  has_gmail_access BOOLEAN DEFAULT false,
  has_calendar_access BOOLEAN DEFAULT false,
  has_business_access BOOLEAN DEFAULT false,
  last_email_sync TIMESTAMP WITH TIME ZONE,
  last_calendar_sync TIMESTAMP WITH TIME ZONE,
  last_business_sync TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  name TEXT,
  location TEXT,
  city TEXT,
  listing_type TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  status TEXT DEFAULT 'incomplete',
  internal_notes TEXT,
  max_guests INTEGER DEFAULT 1,
  check_in_time TEXT,
  check_out_time TEXT,
  rules TEXT[] DEFAULT '{}',
  base_price NUMERIC DEFAULT 0,
  calendar_ical_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7B. Create Listing Integrations Table
CREATE TABLE IF NOT EXISTS public.listing_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  external_ical_url TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'not_connected',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT listing_platform_unique UNIQUE (listing_id, platform)
);

-- 7C. Create Listing Calendars Table
CREATE TABLE IF NOT EXISTS public.listing_calendars (
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE PRIMARY KEY,
  nodebase_ical_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Guests Table
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  channel TEXT DEFAULT 'direct',
  id_verification_status TEXT DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  guest_contact TEXT,
  amount NUMERIC DEFAULT 0,
  payment_id UUID,
  id_status TEXT DEFAULT 'not_requested',
  status TEXT DEFAULT 'draft',
  source TEXT DEFAULT 'nodebase',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8B. Create Payment Accounts Table
CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'not_set',
  onboarding_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT payment_accounts_user_provider_unique UNIQUE (user_id, provider)
);

-- 8C. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_link TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8D. Create Guest IDs Table
CREATE TABLE IF NOT EXISTS public.guest_ids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  id_type TEXT NOT NULL,
  status TEXT DEFAULT 'requested',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  uploaded_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  front_image_path TEXT,
  back_image_path TEXT,
  upload_token TEXT UNIQUE,
  rejection_reason TEXT
);

-- 9. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  direction TEXT NOT NULL, -- inbound / outbound
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- debit / credit
  amount NUMERIC NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'completed', -- completed / pending / failed
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Create Admin Audit Logs Table (renumbered)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datacenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaisa_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 14. Create Policies (Basic)
-- Users can read/update their own data
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Integrations policies
CREATE POLICY "Users can view own integrations" ON public.integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own integrations" ON public.integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations" ON public.integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations" ON public.integrations FOR DELETE USING (auth.uid() = user_id);

-- Google context policies
CREATE POLICY "Users can view own google context" ON public.google_context FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own google context" ON public.google_context FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own google context" ON public.google_context FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own google context" ON public.google_context FOR DELETE USING (auth.uid() = user_id);

-- Listings policies
CREATE POLICY "Users can view own listings" ON public.listings FOR SELECT USING (auth.uid() = host_id);
CREATE POLICY "Users can view own listing integrations" ON public.listing_integrations FOR SELECT USING (
  exists (select 1 from public.listings where listings.id = listing_integrations.listing_id and listings.host_id = auth.uid())
);
CREATE POLICY "Users can insert own listing integrations" ON public.listing_integrations FOR INSERT WITH CHECK (
  exists (select 1 from public.listings where listings.id = listing_integrations.listing_id and listings.host_id = auth.uid())
);
CREATE POLICY "Users can update own listing integrations" ON public.listing_integrations FOR UPDATE USING (
  exists (select 1 from public.listings where listings.id = listing_integrations.listing_id and listings.host_id = auth.uid())
);
CREATE POLICY "Users can delete own listing integrations" ON public.listing_integrations FOR DELETE USING (
  exists (select 1 from public.listings where listings.id = listing_integrations.listing_id and listings.host_id = auth.uid())
);

CREATE POLICY "Users can view own listing calendars" ON public.listing_calendars FOR SELECT USING (
  exists (select 1 from public.listings where listings.id = listing_calendars.listing_id and listings.host_id = auth.uid())
);
CREATE POLICY "Users can insert own listing calendars" ON public.listing_calendars FOR INSERT WITH CHECK (
  exists (select 1 from public.listings where listings.id = listing_calendars.listing_id and listings.host_id = auth.uid())
);
CREATE POLICY "Users can update own listing calendars" ON public.listing_calendars FOR UPDATE USING (
  exists (select 1 from public.listings where listings.id = listing_calendars.listing_id and listings.host_id = auth.uid())
);
CREATE POLICY "Users can delete own listing calendars" ON public.listing_calendars FOR DELETE USING (
  exists (select 1 from public.listings where listings.id = listing_calendars.listing_id and listings.host_id = auth.uid())
);

CREATE POLICY "Users can view own payment accounts" ON public.payment_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment accounts" ON public.payment_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payment accounts" ON public.payment_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own payment accounts" ON public.payment_accounts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (
  exists (select 1 from public.bookings where bookings.id = payments.booking_id and bookings.listing_id in (
    select id from public.listings where listings.host_id = auth.uid()
  ))
);

CREATE POLICY "Users can view own guest IDs" ON public.guest_ids FOR SELECT USING (
  exists (select 1 from public.bookings join public.listings on listings.id = bookings.listing_id where bookings.id = guest_ids.booking_id and listings.host_id = auth.uid())
);

CREATE POLICY "Users can update own guest IDs" ON public.guest_ids FOR UPDATE USING (
  exists (select 1 from public.bookings join public.listings on listings.id = bookings.listing_id where bookings.id = guest_ids.booking_id and listings.host_id = auth.uid())
);

-- Insert Policies (Allow server to insert)
-- Since we are using Service Role Key on server, these are strictly not needed for server actions,
-- but helpful if we ever switch to client-side actions.
-- For now, we rely on Service Role Bypass.

-- Seed Initial Datacenter (Okhla, Delhi)
INSERT INTO public.datacenters (name, location, total_capacity, active_nodes)
VALUES ('Okhla DC-1', 'Okhla, Delhi', 180, 6)
ON CONFLICT DO NOTHING;
