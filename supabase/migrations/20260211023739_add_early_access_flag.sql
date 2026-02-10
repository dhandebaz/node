
-- Add early_access column to tenants table
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS early_access BOOLEAN DEFAULT FALSE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_tenants_early_access ON tenants(early_access);
