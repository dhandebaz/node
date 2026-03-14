-- Migration: Final RLS Recursion Fix
-- Replaces recursive "exists (select 1 from public.users ...)" checks with non-recursive JWT metadata checks.

-- 1. Reset USERS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL
    USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'))
    WITH CHECK (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- 2. Reset TENANTS policies
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Admins can view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Admins can manage all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view tenants they belong to" ON public.tenants;
DROP POLICY IF EXISTS "Users can update tenants they belong to" ON public.tenants;

CREATE POLICY "Members can view own tenant" ON public.tenants
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.tenant_users WHERE tenant_id = tenants.id AND user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all tenants" ON public.tenants
    FOR ALL
    USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- 3. Reset TENANT_USERS policies
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.tenant_users;
DROP POLICY IF EXISTS "Admins can manage all memberships" ON public.tenant_users;
DROP POLICY IF EXISTS "Users can view their own tenant memberships" ON public.tenant_users;

CREATE POLICY "Users can view own memberships" ON public.tenant_users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all memberships" ON public.tenant_users
    FOR ALL
    USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- 4. Reset SYSTEM_SETTINGS policies
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;

CREATE POLICY "Admins can manage system settings" ON public.system_settings
    FOR ALL
    USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));

-- 5. Reset ADMIN_AUDIT_LOGS policies
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;

CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin'));
