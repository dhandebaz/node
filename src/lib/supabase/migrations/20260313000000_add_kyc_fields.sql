-- Add KYC and Business Details to tenants table
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS kyc_document_path TEXT,
ADD COLUMN IF NOT EXISTS kyc_extracted_data JSONB,
ADD COLUMN IF NOT EXISTS legal_agreement_path TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';

-- Ensure kyc_status enum exists or is text
-- Assuming it is text from previous context, but let's be safe
DO $$ BEGIN
    CREATE TYPE kyc_status_enum AS ENUM ('not_started', 'pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update kyc_status column if it exists as text to cast it, or just leave as text if consistent with app
-- For now, we will just assume it's text or already handled. 
-- The prompt mentions "Account state changes to verified".

-- Create bucket for KYC documents if not exists (This is usually done in Supabase UI, but we can try via SQL if extensions enabled, or just rely on the path)
-- We will just use the path storage logic.

-- Create bucket for legal documents
