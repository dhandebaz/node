-- Migration: Update admin_audit_logs for generic resource logging
-- Run this in your Supabase SQL Editor

-- 1. Add generic target columns to admin_audit_logs
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_audit_logs' AND column_name = 'target_resource') THEN
    ALTER TABLE public.admin_audit_logs ADD COLUMN target_resource TEXT DEFAULT 'user'; -- user, node, listing, system
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_audit_logs' AND column_name = 'target_resource_id') THEN
    ALTER TABLE public.admin_audit_logs ADD COLUMN target_resource_id UUID;
  END IF;

  -- Add previous/new value columns for detailed auditing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_audit_logs' AND column_name = 'previous_value') THEN
    ALTER TABLE public.admin_audit_logs ADD COLUMN previous_value JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_audit_logs' AND column_name = 'new_value') THEN
    ALTER TABLE public.admin_audit_logs ADD COLUMN new_value JSONB;
  END IF;
END $$;
