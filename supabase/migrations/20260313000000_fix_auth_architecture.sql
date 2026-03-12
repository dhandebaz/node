-- FIX: RLS Recursion and Tenant Access
-- This migration fixes the "infinite recursion" error in RLS policies for `public.users`
-- and ensures robust access to `tenants` and `tenant_users`.

-- 1. Fix Recursive Policy on public.users
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL
  USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin')
  )
  WITH CHECK (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin')
  );

-- 2. Ensure Tenant Access Policies exist and are non-recursive
-- Tenants should be visible to members (via tenant_users) or admins (via JWT role)

DROP POLICY IF EXISTS "Members can view own tenant" ON public.tenants;
CREATE POLICY "Members can view own tenant" ON public.tenants
    FOR SELECT USING (
        exists (select 1 from public.tenant_users where tenant_id = tenants.id and user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can view all tenants" ON public.tenants;
CREATE POLICY "Admins can view all tenants" ON public.tenants
    FOR ALL USING (
        coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin')
    );

-- 3. Ensure Tenant Users Access Policies exist
-- Users can see their own memberships
DROP POLICY IF EXISTS "Users can view own memberships" ON public.tenant_users;
CREATE POLICY "Users can view own memberships" ON public.tenant_users
    FOR SELECT USING (user_id = auth.uid());

-- Admins can manage all memberships
DROP POLICY IF EXISTS "Admins can manage all memberships" ON public.tenant_users;
CREATE POLICY "Admins can manage all memberships" ON public.tenant_users
    FOR ALL USING (
        coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin')
    );

-- 4. Ensure Kaisa Accounts Access (for Onboarding)
-- Users can manage their own Kaisa account
DROP POLICY IF EXISTS "Users can manage own kaisa account" ON public.kaisa_accounts;
CREATE POLICY "Users can manage own kaisa account" ON public.kaisa_accounts
    FOR ALL USING (user_id = auth.uid());

-- 5. Ensure Accounts Access (for Onboarding)
DROP POLICY IF EXISTS "Users can manage own account" ON public.accounts;
CREATE POLICY "Users can manage own account" ON public.accounts
    FOR ALL USING (user_id = auth.uid());
