-- 1. System Flags (Global Kill Switches & Settings)
create table if not exists public.system_flags (
  key text primary key,
  value boolean not null default true, -- Default to ENABLED for features
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id)
);

-- RLS for System Flags
alter table public.system_flags enable row level security;

-- Everyone can read system flags
create policy "Everyone can read system flags"
  on public.system_flags for select
  using (true);

-- Only superadmins can update
create policy "Superadmins can update system flags"
  on public.system_flags for update
  using ( 
    auth.jwt() ->> 'role' = 'service_role' 
    or 
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'superadmin' 
  );

-- 2. Feature Flags
create table if not exists public.feature_flags (
  key text primary key,
  description text,
  is_global_enabled boolean not null default false,
  tenant_overrides jsonb default '[]'::jsonb, -- Array of tenant_ids where flag is enabled
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feature_flags enable row level security;

create policy "Everyone can read feature flags"
  on public.feature_flags for select
  using (true);

create policy "Superadmins can manage feature flags"
  on public.feature_flags for all
  using ( 
    auth.jwt() ->> 'role' = 'service_role' 
    or 
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'superadmin' 
  );

-- 3. Tenant Controls
alter table public.tenants 
  add column if not exists is_ai_enabled boolean default true,
  add column if not exists is_messaging_enabled boolean default true,
  add column if not exists is_bookings_enabled boolean default true,
  add column if not exists is_wallet_enabled boolean default true;

-- 4. Seed initial System Flags
insert into public.system_flags (key, value, description) values
  ('ai_global_enabled', true, 'Global AI Replies'),
  ('payments_global_enabled', true, 'Global Payment Links'),
  ('bookings_global_enabled', true, 'Global New Bookings'),
  ('messaging_global_enabled', true, 'Global Outbound Messaging'),
  ('sync_global_enabled', true, 'Global Integrations Sync'),
  ('incident_mode_enabled', false, 'System Incident Mode')
on conflict (key) do nothing;
