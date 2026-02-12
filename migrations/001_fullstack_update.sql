-- Migration: Create system_settings and update users table
-- Run this in your Supabase SQL Editor

-- 1. Create system_settings table for global admin config
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES public.users(id)
);

-- 2. Add RLS to system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins/service role can view/edit settings
-- (Assuming service role bypasses RLS, otherwise we need a policy)
CREATE POLICY "Admins can view system settings" ON public.system_settings
  FOR SELECT USING (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

CREATE POLICY "Admins can update system settings" ON public.system_settings
  FOR ALL USING (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- 3. Add 'status' column to users table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
    ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'active'; -- active, suspended, blocked
  END IF;
END $$;

-- 4. Add 'tags' and 'notes' to users table (as JSONB or arrays)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'metadata') THEN
    ALTER TABLE public.users ADD COLUMN metadata JSONB DEFAULT '{"tags": [], "notes": []}'::jsonb;
  END IF;
END $$;
