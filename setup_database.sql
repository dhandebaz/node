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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT kaisa_user_unique UNIQUE (user_id)
);

-- 6. Create Admin Audit Logs Table
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
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Allow Service Role (Server) full access to everything (This is default usually, but good to be explicit if using custom claims)
-- Note: Service Role bypasses RLS automatically in Supabase Client if using Service Role Key.
-- But we need policies for public/anon access if any.

-- Public Read Policies (for client-side fetching if needed)
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.datacenters FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.nodes FOR SELECT USING (true);

-- Insert Policies (Allow server to insert)
-- Since we are using Service Role Key on server, these are strictly not needed for server actions,
-- but helpful if we ever switch to client-side actions.
-- For now, we rely on Service Role Bypass.

-- Seed Initial Datacenter (Okhla, Delhi)
INSERT INTO public.datacenters (name, location, total_capacity, active_nodes)
VALUES ('Okhla DC-1', 'Okhla, Delhi', 180, 6)
ON CONFLICT DO NOTHING;
