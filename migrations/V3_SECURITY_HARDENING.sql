-- V3 SECURITY HARDENING & SCHEMA STANDARDIZATION
-- This script applies uniform RLS policies, indexes, and security constraints to ALL public tables.

-- 1. Enable RLS and FORCE RLS on ALL tables with tenant_id
DO $$ 
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.columns 
    WHERE table_schema = 'public' AND column_name = 'tenant_id'
  LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    
    -- Force RLS even for table owners (Supabase default is safe but let's be explicit)
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
    
    -- Drop existing isolation policies
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_%I ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_tenant_isolation ON public.%I', t, t);
    
    -- Create uniform tenant isolation policy
    -- Uses tenant_users for multi-membership check
    EXECUTE format('CREATE POLICY tenant_isolation_%I ON public.%I FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()))', t, t);
    
    -- Ensure index on tenant_id for performance
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_tenant_id ON public.%I(tenant_id)', t, t);
    
    RAISE NOTICE 'Applied security standards to table: %', t;
  END LOOP;
END $$;

-- 2. Core Security Hardening (Non-Tenant Tables)

-- USERS Table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);

-- TENANTS Table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view own tenant" ON public.tenants;
CREATE POLICY "Members can view own tenant" ON public.tenants FOR SELECT USING (EXISTS (SELECT 1 FROM public.tenant_users WHERE tenant_id = tenants.id AND user_id = auth.uid()));

-- TENANT_USERS Table
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.tenant_users;
CREATE POLICY "Users can view own memberships" ON public.tenant_users FOR SELECT USING (user_id = auth.uid());

-- 3. Public Exceptions (Must be carefully managed)

-- Guest Portal Public Access
DROP POLICY IF EXISTS public_access_guest_checkins ON public.guest_checkins;
CREATE POLICY public_access_guest_checkins ON public.guest_checkins FOR ALL USING (true);

-- Public Listing View (Allow viewing available dates/prices)
DROP POLICY IF EXISTS public_access_listings ON public.listings;
CREATE POLICY public_access_listings ON public.listings FOR SELECT USING (true);

-- Public Knowledge Search (Kaisa can read knowledge chunks)
DROP POLICY IF EXISTS public_access_knowledge_chunks ON public.knowledge_chunks;
CREATE POLICY public_access_knowledge_chunks ON public.knowledge_chunks FOR SELECT USING (true);

-- 4. Cleanup redundant legacy policies
DO $$ 
DECLARE
  pol_record RECORD;
BEGIN
  FOR pol_record IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND (policyname LIKE 'Members can view%' OR policyname LIKE 'Users can view%')
    AND tablename NOT IN ('users', 'tenants', 'tenant_users')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_record.policyname, pol_record.tablename);
  END LOOP;
END $$;
