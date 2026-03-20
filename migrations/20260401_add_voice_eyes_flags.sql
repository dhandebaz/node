-- Migration: 2026-04-01
-- Purpose: Seed default system flags for Nodebase Voice and Nodebase Eyes
-- These flags are intentionally defaulted to FALSE so the features remain gated
-- until administrators explicitly enable them via admin controls.
--
-- This migration is idempotent: it will not overwrite existing flags.

BEGIN;

INSERT INTO public.system_flags (key, value, description)
VALUES
  ('voice_global_enabled', false, 'Enable/disable Nodebase Voice (telephony) globally'),
  ('eyes_global_enabled', false, 'Enable/disable Nodebase Eyes (CCTV & vision) globally')
ON CONFLICT (key) DO NOTHING;

COMMIT;
