-- Clean up Investor Portal related tables and RLS policies

-- 1. Drop Policies
DROP POLICY IF EXISTS "Users can view own documents" ON public.investor_documents;
DROP POLICY IF EXISTS "Admins can manage investor documents" ON public.investor_documents;
DROP POLICY IF EXISTS "Users can view own reports" ON public.investor_reports;
DROP POLICY IF EXISTS "Admins can manage investor reports" ON public.investor_reports;

-- 2. Drop Tables
DROP TABLE IF EXISTS public.investor_documents;
DROP TABLE IF EXISTS public.investor_reports;
