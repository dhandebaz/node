-- Consolidated Migration Script
-- Run this in your Supabase SQL Editor to apply all schema changes and fixes.

-- 1. Create Enums (Idempotent)
DO $$ BEGIN
    CREATE TYPE product_type_enum AS ENUM ('ai_employee', 'space');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status_enum AS ENUM ('not_started', 'pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add Tenant Columns (Safe updates)
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS kyc_document_path TEXT,
ADD COLUMN IF NOT EXISTS kyc_extracted_data JSONB,
ADD COLUMN IF NOT EXISTS legal_agreement_path TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT;

-- Add kyc_status safely
DO $$ BEGIN
    ALTER TABLE public.tenants ADD COLUMN kyc_status kyc_status_enum DEFAULT 'not_started';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add Unique Constraint for Username
DO $$ BEGIN
    ALTER TABLE public.tenants ADD CONSTRAINT tenants_username_unique UNIQUE (username);
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN others THEN null;
END $$;

-- 3. Create Tenant Users (Join Table)
CREATE TABLE IF NOT EXISTS public.tenant_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'staff')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tenant_id, user_id)
);

-- 4. Create Accounts Table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_type product_type_enum,
  onboarding_status TEXT DEFAULT 'pending',
  tenant_id UUID REFERENCES public.tenants(id),
  business_type TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT accounts_user_id_unique UNIQUE (user_id)
);

-- 5. Add tenant_id to existing tables (Safe)
DO $$ 
DECLARE
    t text;
    tables text[] := ARRAY[
        'listings', 'bookings', 'guests', 'messages', 'wallet_transactions', 
        'guest_ids', 'integrations', 'payments', 'listing_calendars', 
        'listing_integrations', 'kaisa_accounts', 'ai_usage_events', 
        'system_logs', 'invoices'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id)', t);
            
            -- Add index for performance
            EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_tenant ON public.%I(tenant_id)', t, t);
            
            -- Enable RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
            
            -- Drop existing policy if exists to avoid error on recreation
            BEGIN
                EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_%I_select" ON public.%I', t, t);
                EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_%I_insert" ON public.%I', t, t);
                EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_%I_update" ON public.%I', t, t);
                EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_%I_delete" ON public.%I', t, t);
            EXCEPTION WHEN OTHERS THEN NULL; END;

            -- Create Policies
            EXECUTE format('CREATE POLICY "tenant_isolation_%I_select" ON public.%I FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()))', t, t);
            EXECUTE format('CREATE POLICY "tenant_isolation_%I_insert" ON public.%I FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()))', t, t);
            EXECUTE format('CREATE POLICY "tenant_isolation_%I_update" ON public.%I FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()))', t, t);
            EXECUTE format('CREATE POLICY "tenant_isolation_%I_delete" ON public.%I FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()))', t, t);
        END IF;
    END LOOP;
END $$;

-- 6. Enable RLS on Tenants and Tenant Users
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Policies for Tenants/Users
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own tenant memberships" ON public.tenant_users;
  CREATE POLICY "Users can view their own tenant memberships" ON public.tenant_users FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view tenants they belong to" ON public.tenants;
  CREATE POLICY "Users can view tenants they belong to" ON public.tenants FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tenant_users WHERE tenant_users.tenant_id = tenants.id AND tenant_users.user_id = auth.uid())
  );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own account" ON public.accounts;
  CREATE POLICY "Users can view own account" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own account" ON public.accounts;
  CREATE POLICY "Users can update own account" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own account" ON public.accounts;
  CREATE POLICY "Users can insert own account" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 7. Fix Listing Columns
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS check_in_time TEXT,
ADD COLUMN IF NOT EXISTS check_out_time TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';

ALTER TABLE public.listing_integrations
ADD COLUMN IF NOT EXISTS external_ical_url TEXT;
