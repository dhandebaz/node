-- Security Hardening: Missing RLS Policies

-- 1. Ensure RLS is enabled on ALL critical tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Tenant Policies
-- Tenants should only be visible to their members or admins
DROP POLICY IF EXISTS "Members can view own tenant" ON public.tenants;
CREATE POLICY "Members can view own tenant" ON public.tenants
    FOR SELECT USING (
        exists (select 1 from public.tenant_users where tenant_id = tenants.id and user_id = auth.uid())
    );

-- Admins can view all tenants
DROP POLICY IF EXISTS "Admins can view all tenants" ON public.tenants;
CREATE POLICY "Admins can view all tenants" ON public.tenants
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role IN ('admin', 'superadmin'))
    );

-- 3. Tenant Users Policies
-- Users can see their own memberships
DROP POLICY IF EXISTS "Users can view own memberships" ON public.tenant_users;
CREATE POLICY "Users can view own memberships" ON public.tenant_users
    FOR SELECT USING (user_id = auth.uid());

-- Admins can manage all memberships
DROP POLICY IF EXISTS "Admins can manage all memberships" ON public.tenant_users;
CREATE POLICY "Admins can manage all memberships" ON public.tenant_users
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role IN ('admin', 'superadmin'))
    );

-- 4. System Settings (Admin Only)
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings" ON public.system_settings
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role IN ('admin', 'superadmin'))
    );

-- 5. Admin Audit Logs (Admin Read Only)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (
        exists (select 1 from public.users where id = auth.uid() and role IN ('admin', 'superadmin'))
    );

-- 6. Prevent Public Access to Users Table (Critical)
-- Users should only see themselves or be seen by admins
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role IN ('admin', 'superadmin'))
    );
