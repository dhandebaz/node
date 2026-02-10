
-- Create product type enum
DO $$ BEGIN
    CREATE TYPE product_type_enum AS ENUM ('ai_employee', 'space');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_type product_type_enum,
  onboarding_status TEXT DEFAULT 'pending', -- 'pending', 'complete'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT accounts_user_id_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own account" ON public.accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own account" ON public.accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own account" ON public.accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add missing columns to listings if any
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS check_in_time TEXT,
ADD COLUMN IF NOT EXISTS check_out_time TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';

-- Ensure listing_integrations has external_ical_url
ALTER TABLE public.listing_integrations
ADD COLUMN IF NOT EXISTS external_ical_url TEXT;
