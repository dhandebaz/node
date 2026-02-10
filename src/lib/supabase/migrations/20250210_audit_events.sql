-- Create audit_events table
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id),
  actor_type text not null check (actor_type in ('user', 'ai', 'system', 'admin')),
  actor_id uuid, -- nullable for system/ai sometimes, though usually we might want to link to a user if possible, or null for pure system
  event_type text not null,
  entity_type text not null, -- booking | message | listing | payment | guest_id
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.audit_events enable row level security;

-- Policies

-- 1. Tenant Users can view their own tenant's audit logs (for customer-facing timelines)
create policy "tenant_isolation_audit_events_select" on public.audit_events
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- 2. Admins can view ALL audit logs
create policy "admins_view_all_audit_events" on public.audit_events
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role in ('admin', 'superadmin')
    )
  );

-- No update/delete policies = immutable by default for standard users.
-- Service role can still do anything.

-- Indexes for performance
create index idx_audit_events_tenant_id on public.audit_events(tenant_id);
create index idx_audit_events_entity_id on public.audit_events(entity_id);
create index idx_audit_events_created_at on public.audit_events(created_at);
create index idx_audit_events_event_type on public.audit_events(event_type);
