-- Migration: Fix kaisa_accounts schema
-- Adds missing tenant_id column and default role for AI Employee accounts.

-- 1. Add tenant_id column if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'kaisa_accounts' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.kaisa_accounts ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Add role column if missing (Required for legacy sync)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'kaisa_accounts' AND column_name = 'role') THEN
        ALTER TABLE public.kaisa_accounts ADD COLUMN role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('manager', 'co-founder'));
    ELSE
        -- If it exists, ensure it has the default
        ALTER TABLE public.kaisa_accounts ALTER COLUMN role SET DEFAULT 'manager';
        UPDATE public.kaisa_accounts SET role = 'manager' WHERE role IS NULL;
    END IF;
END $$;

-- 4. Enable RLS and add policies if missing
ALTER TABLE public.kaisa_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kaisa_accounts' AND policyname = 'Tenants can view their own kaisa accounts') THEN
        CREATE POLICY "Tenants can view their own kaisa accounts" ON public.kaisa_accounts FOR SELECT 
        USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));
    END IF;
END $$;
