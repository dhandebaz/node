-- Add credentials column to integrations table
ALTER TABLE public.integrations 
ADD COLUMN IF NOT EXISTS credentials JSONB;

-- Allow 'active' status check if there is one (usually text, so no change needed unless enum)
-- If status has a check constraint, we might need to drop/update it.
-- Assuming status is TEXT based on previous migrations.
