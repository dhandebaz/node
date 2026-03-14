-- Add onboarding details to accounts table
alter table public.accounts
add column if not exists onboarding_milestones jsonb default '[]'::jsonb;

-- Add impersonation audit to audit_events
alter table public.audit_events
add column if not exists is_impersonated boolean default false;
