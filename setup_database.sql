-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'customer',
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

-- 6. Create Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  max_guests INTEGER DEFAULT 1,
  check_in_time TEXT,
  check_out_time TEXT,
  rules TEXT[] DEFAULT '{}',
  base_price NUMERIC DEFAULT 0,
  calendar_ical_url TEXT,
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
  status TEXT DEFAULT 'pending',
  source TEXT DEFAULT 'nodebase',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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

-- 11. Create Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datacenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaisa_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Allow Service Role (Server) full access to everything (This is default usually, but good to be explicit if using custom claims)
-- Note: Service Role bypasses RLS automatically in Supabase Client if using Service Role Key.
-- But we need policies for public/anon access if any.

-- Public Read Policies (for client-side fetching if needed)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.datacenters;
CREATE POLICY "Enable read access for all users" ON public.datacenters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.nodes;
CREATE POLICY "Enable read access for all users" ON public.nodes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.listings;
CREATE POLICY "Enable read access for all users" ON public.listings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.guests;
CREATE POLICY "Enable read access for all users" ON public.guests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.bookings;
CREATE POLICY "Enable read access for all users" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.messages;
CREATE POLICY "Enable read access for all users" ON public.messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.wallet_transactions;
CREATE POLICY "Enable read access for all users" ON public.wallet_transactions FOR SELECT USING (true);

-- Insert Policies (Allow server to insert)
-- Since we are using Service Role Key on server, these are strictly not needed for server actions,
-- but helpful if we ever switch to client-side actions.
-- For now, we rely on Service Role Bypass.

-- Seed Initial Datacenter (Okhla, Delhi)
INSERT INTO public.datacenters (name, location, total_capacity, active_nodes)
VALUES ('Okhla DC-1', 'Okhla, Delhi', 180, 6)
ON CONFLICT DO NOTHING;
