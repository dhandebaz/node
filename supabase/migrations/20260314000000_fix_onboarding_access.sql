-- Migration: Fix onboarding access and relationships
-- Consolidation of RLS fixes and missing relationships.

-- 1. Tenants Table: Add INSERT policy for owner
DROP POLICY IF EXISTS "Users can create own tenant" ON public.tenants;
CREATE POLICY "Users can create own tenant" ON public.tenants
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_user_id);

-- 2. Kaisa Accounts: Fix Relationship and Schema
-- Ensure user_id references public.users(id) explicitly for PostgREST to find the relationship
DO $$ BEGIN
    -- Drop existing if it exists (might be named differently or point to auth.users)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'kaisa_accounts' AND constraint_name = 'kaisa_accounts_user_id_fkey') THEN
        ALTER TABLE public.kaisa_accounts DROP CONSTRAINT kaisa_accounts_user_id_fkey;
    END IF;
    
    -- Explicitly reference public.users(id)
    ALTER TABLE public.kaisa_accounts 
    ADD CONSTRAINT kaisa_accounts_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
END $$;

-- Ensure tenant_id exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'kaisa_accounts' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.kaisa_accounts ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure role exists with default
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'kaisa_accounts' AND column_name = 'role') THEN
        ALTER TABLE public.kaisa_accounts ADD COLUMN role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('manager', 'co-founder'));
    ELSE
        ALTER TABLE public.kaisa_accounts ALTER COLUMN role SET DEFAULT 'manager';
        UPDATE public.kaisa_accounts SET role = 'manager' WHERE role IS NULL;
    END IF;
END $$;
