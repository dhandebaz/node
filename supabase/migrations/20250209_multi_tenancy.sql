-- 1. Create Tenants Table
create table if not exists public.tenants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Tenant Users (Join Table)
create table if not exists public.tenant_users (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text check (role in ('owner', 'admin', 'staff')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(tenant_id, user_id)
);

-- 3. Add tenant_id to existing tables
do $$ 
begin
  -- Listings
  if exists (select from information_schema.tables where table_name = 'listings') then
    alter table public.listings add column if not exists tenant_id uuid references public.tenants(id);
  end if;

  -- Bookings
  if exists (select from information_schema.tables where table_name = 'bookings') then
    alter table public.bookings add column if not exists tenant_id uuid references public.tenants(id);
  end if;

  -- Guests
  if exists (select from information_schema.tables where table_name = 'guests') then
    alter table public.guests add column if not exists tenant_id uuid references public.tenants(id);
  end if;

  -- Messages
  if exists (select from information_schema.tables where table_name = 'messages' and table_schema = 'public') then
    alter table public.messages add column if not exists tenant_id uuid references public.tenants(id);
  end if;

  -- Wallet Transactions
  if exists (select from information_schema.tables where table_name = 'wallet_transactions') then
    alter table public.wallet_transactions add column if not exists tenant_id uuid references public.tenants(id);
  end if;
  
  -- Guest IDs
  if exists (select from information_schema.tables where table_name = 'guest_ids') then
    alter table public.guest_ids add column if not exists tenant_id uuid references public.tenants(id);
  end if;

  -- Integrations
  if exists (select from information_schema.tables where table_name = 'integrations') then
    alter table public.integrations add column if not exists tenant_id uuid references public.tenants(id);
  end if;

    -- Payment Records
  if exists (select from information_schema.tables where table_name = 'payment_records') then
    alter table public.payment_records add column if not exists tenant_id uuid references public.tenants(id);
  end if;

  -- Listing Calendars
  if exists (select from information_schema.tables where table_name = 'listing_calendars') then
    alter table public.listing_calendars add column if not exists tenant_id uuid references public.tenants(id);
  end if;

  -- Listing Integrations
  if exists (select from information_schema.tables where table_name = 'listing_integrations') then
    alter table public.listing_integrations add column if not exists tenant_id uuid references public.tenants(id);
  end if;

  -- Kaisa Accounts
  if exists (select from information_schema.tables where table_name = 'kaisa_accounts') then
    alter table public.kaisa_accounts add column if not exists tenant_id uuid references public.tenants(id);
  end if;

  -- AI Usage Events
  if exists (select from information_schema.tables where table_name = 'ai_usage_events') then
    alter table public.ai_usage_events add column if not exists tenant_id uuid references public.tenants(id);
  end if;

  -- System Logs
  if exists (select from information_schema.tables where table_name = 'system_logs') then
    alter table public.system_logs add column if not exists tenant_id uuid references public.tenants(id);
  end if;

  -- Invoices
  if exists (select from information_schema.tables where table_name = 'invoices') then
    alter table public.invoices add column if not exists tenant_id uuid references public.tenants(id);
  end if;

end $$;

-- 4. Enable RLS on Tenants and Tenant Users
alter table public.tenants enable row level security;
alter table public.tenant_users enable row level security;

-- Policies for Tenant Users (Access to own membership)
create policy "Users can view their own tenant memberships"
  on public.tenant_users for select
  using (auth.uid() = user_id);

-- Policies for Tenants (Access via Tenant Users)
create policy "Users can view tenants they belong to"
  on public.tenants for select
  using (exists (
    select 1 from public.tenant_users
    where tenant_users.tenant_id = tenants.id
    and tenant_users.user_id = auth.uid()
  ));

create policy "Users can update tenants they belong to"
  on public.tenants for update
  using (exists (
    select 1 from public.tenant_users
    where tenant_users.tenant_id = tenants.id
    and tenant_users.user_id = auth.uid()
    and tenant_users.role in ('owner', 'admin')
  ));

-- 5. Add RLS Policies for Tenant Isolation (Generic Template for other tables)
-- We'll apply these to specific tables in separate steps or a loop if dynamic SQL is used.
-- Here we manually add for core tables if they exist.

-- Listings
-- (Assuming RLS is enabled on listings)
-- drop policy if exists "tenant_isolation_listings_select" on public.listings;
-- create policy "tenant_isolation_listings_select" on public.listings
--   for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- (Repeat for insert/update/delete as needed)
