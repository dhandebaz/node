
-- Add onboarding details to tenants table
alter table public.tenants
add column if not exists property_count integer,
add column if not exists platforms text[];
