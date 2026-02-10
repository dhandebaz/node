-- Create failures table
create table if not exists failures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) not null,
  category text not null check (category in ('auth', 'integration', 'payment', 'calendar', 'ai')),
  source text not null, -- 'google', 'whatsapp', 'system', etc.
  severity text not null check (severity in ('info', 'warning', 'critical')),
  message text not null,
  is_active boolean default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  resolved_at timestamp with time zone
);

-- Enable RLS
alter table failures enable row level security;

-- Create RLS Policy for Select (Tenants can see their own failures)
create policy "Tenants can view their own failures"
  on failures
  for select
  using (
    exists (
      select 1 from tenant_users
      where tenant_users.tenant_id = failures.tenant_id
      and tenant_users.user_id = auth.uid()
    )
  );

-- Create RLS Policy for Admin (Admins can view all failures - assuming service role or specific admin logic, 
-- but strictly speaking based on previous instructions, admins might need explicit access. 
-- For now, we rely on the tenant isolation policy. 
-- If there is a super_admin role, we might need a separate policy, but previous instructions favored explicit admin policies or service role.)

-- Create index for faster lookups
create index idx_failures_tenant_active on failures(tenant_id, is_active);
create index idx_failures_category on failures(category);
