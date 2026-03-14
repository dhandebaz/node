-- SUPABASE RLS GIGA-CLEAN & REBUILD
-- This script nukes ALL policies on core tables and rebuilds them with recursion-safe logic.

DO $$ 
DECLARE
    r RECORD;
    target_tables TEXT[] := ARRAY['users', 'tenants', 'tenant_users', 'accounts', 'kaisa_accounts', 'system_settings', 'admin_audit_logs', 'system_flags', 'feature_flags'];
    t TEXT;
BEGIN
    -- 1. NUKE: Drop every single policy on target tables
    FOREACH t IN ARRAY target_tables LOOP
        FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t) LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, t);
        END LOOP;
    END LOOP;
END $$;

-- 2. REBUILD: Apply Safe, Non-Recursive Policies

-- USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users browse self" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins manage users" ON public.users FOR ALL 
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- TENANTS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view tenants" ON public.tenants FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.tenant_users WHERE tenant_id = tenants.id AND user_id = auth.uid()));
CREATE POLICY "Admins manage tenants" ON public.tenants FOR ALL 
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- TENANT_USERS
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view memberships" ON public.tenant_users FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins manage memberships" ON public.tenant_users FOR ALL 
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- ACCOUNTS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage account" ON public.accounts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins manage accounts" ON public.accounts FOR ALL 
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- KAISA ACCOUNTS
ALTER TABLE public.kaisa_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage kaisa account" ON public.kaisa_accounts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins manage kaisa accounts" ON public.kaisa_accounts FOR ALL 
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- SYSTEM FLAGS & SETTINGS (Read by everyone, manage by Admin)
ALTER TABLE public.system_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone read flags" ON public.system_flags FOR SELECT USING (true);
CREATE POLICY "Admins manage flags" ON public.system_flags FOR ALL 
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone read settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.system_settings FOR ALL 
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- FEATURE FLAGS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone read features" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "Admins manage features" ON public.feature_flags FOR ALL 
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- AUDIT LOGS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit" ON public.admin_audit_logs FOR SELECT 
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- 3. DIAGNOSTIC: List active policies to verify
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;
