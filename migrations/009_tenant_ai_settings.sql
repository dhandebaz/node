
-- Migration 009: Tenant AI Settings (BYOK)
-- Adds support for tenants to provide their own AI provider and API keys.

ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{
  "provider": "google",
  "model": "gemini-1.5-flash",
  "apiKey": null,
  "customInstructions": null,
  "tone": "friendly"
}'::jsonb;

-- Ensure RLS allows users to see their own tenant settings
-- (Existing policies on 'tenants' table should handle this if they cover the whole row)
