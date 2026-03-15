-- 20260313000001_rebuild_auth_policies.sql
-- COMPLETE RESET of Auth & Tenant RLS Policies to fix recursion and access issues.

-- 1. Enable RLS on core tables (Idempotent)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaisa_accounts ENABLE ROW LEVEL SECURITY;

-- 2. Clean Slate: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;

DROP POLICY IF EXISTS "Members can view own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Admins can view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Admins can manage all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view tenants they belong to" ON public.tenants;

DROP POLICY IF EXISTS "Users can view own memberships" ON public.tenant_users;
DROP POLICY IF EXISTS "Admins can manage all memberships" ON public.tenant_users;
DROP POLICY IF EXISTS "Users can view their own tenant memberships" ON public.tenant_users;

DROP POLICY IF EXISTS "Users can manage own account" ON public.accounts;
DROP POLICY IF EXISTS "Users can manage own kaisa account" ON public.kaisa_accounts;

-- 3. USERS Table Policies (Non-Recursive)
-- Allow users to read their own profile.
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Allow admins to manage all users (using JWT role to avoid table recursion).
CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL
    USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'))
    WITH CHECK (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- 4. TENANTS Table Policies
-- Tenants are visible if you are a member of them.
-- We use a simple EXISTS check against tenant_users.
CREATE POLICY "Members can view own tenant" ON public.tenants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tenant_users
            WHERE tenant_users.tenant_id = tenants.id
            AND tenant_users.user_id = auth.uid()
        )
    );

-- Admins can view/manage all tenants.
CREATE POLICY "Admins can manage all tenants" ON public.tenants
    FOR ALL
    USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- 5. TENANT_USERS Table Policies
-- Users can see their own memberships. This is CRITICAL for the middleware to find the tenant.
CREATE POLICY "Users can view own memberships" ON public.tenant_users
    FOR SELECT USING (user_id = auth.uid());

-- Admins can manage all memberships.
CREATE POLICY "Admins can manage all memberships" ON public.tenant_users
    FOR ALL
    USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- 6. ACCOUNTS Table Policies (for Onboarding)
-- Users can read/update their own account record.
CREATE POLICY "Users can manage own account" ON public.accounts
    FOR ALL USING (user_id = auth.uid());

-- 7. KAISA ACCOUNTS Table Policies
CREATE POLICY "Users can manage own kaisa account" ON public.kaisa_accounts
    FOR ALL USING (user_id = auth.uid());
