-- Migration: Rename Kaisa tables to Omni
-- Date: 2026-04-10

DO $$ 
BEGIN
    -- Rename kaisa_accounts
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'kaisa_accounts') THEN
        ALTER TABLE public.kaisa_accounts RENAME TO omni_accounts;
        -- Rename policies
        ALTER POLICY "tenant_isolation_kaisa_accounts_select" ON public.omni_accounts RENAME TO "tenant_isolation_omni_accounts_select";
        ALTER POLICY "tenant_isolation_kaisa_accounts_insert" ON public.omni_accounts RENAME TO "tenant_isolation_omni_accounts_insert";
        ALTER POLICY "tenant_isolation_kaisa_accounts_update" ON public.omni_accounts RENAME TO "tenant_isolation_omni_accounts_update";
        ALTER POLICY "tenant_isolation_kaisa_accounts_delete" ON public.omni_accounts RENAME TO "tenant_isolation_omni_accounts_delete";
    END IF;

    -- Rename kaisa_credits
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'kaisa_credits') THEN
        ALTER TABLE public.kaisa_credits RENAME TO omni_credits;
        -- Rename index/FKey if needed (PostgreSQL usually handles this, but let's be explicit if they had specific names)
    END IF;

    -- Rename kaisa_flows
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'kaisa_flows') THEN
        ALTER TABLE public.kaisa_flows RENAME TO omni_flows;
    END IF;

    -- Rename kaisa_memories
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'kaisa_memories') THEN
        ALTER TABLE public.kaisa_memories RENAME TO omni_memories;
    END IF;

    -- Rename kaisa_tasks
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'kaisa_tasks') THEN
        ALTER TABLE public.kaisa_tasks RENAME TO omni_tasks;
    END IF;

END $$;
