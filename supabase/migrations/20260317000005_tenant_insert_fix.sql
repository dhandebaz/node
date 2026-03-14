-- Migration: Tenant Insert Fix
-- Allows users to insert their own tenant records during onboarding.

-- 1. Explicitly allow INSERT into tenants if the owner is the current user
DROP POLICY IF EXISTS "Users can create own tenant" ON public.tenants;
CREATE POLICY "Users can create own tenant" ON public.tenants
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_user_id);

-- 2. Ensure ALL other tenant policies are clean (redundancy check)
DROP POLICY IF EXISTS "Members view tenants" ON public.tenants;
CREATE POLICY "Members view tenants" ON public.tenants FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.tenant_users WHERE tenant_id = tenants.id AND user_id = auth.uid()));

-- 3. Verify
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'tenants';
