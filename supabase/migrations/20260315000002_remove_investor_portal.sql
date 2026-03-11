-- Clean up Investor Portal related tables and RLS policies

-- 1. Drop Policies (if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'investor_documents') THEN
        DROP POLICY IF EXISTS "Users can view own documents" ON public.investor_documents;
        DROP POLICY IF EXISTS "Admins can manage investor documents" ON public.investor_documents;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'investor_reports') THEN
        DROP POLICY IF EXISTS "Users can view own reports" ON public.investor_reports;
        DROP POLICY IF EXISTS "Admins can manage investor reports" ON public.investor_reports;
    END IF;
END $$;

-- 2. Drop Tables
DROP TABLE IF EXISTS public.investor_documents;
DROP TABLE IF EXISTS public.investor_reports;
