
-- Add is_memory_enabled to tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS is_memory_enabled BOOLEAN DEFAULT TRUE;
