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
-- We assume these tables exist. If not, this is a conceptual migration for the task.
-- In a real scenario, we'd check existence.

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
  if exists (select from information_schema.tables where table_name = 'messages') then
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

-- Policies for Tenants (Access to tenants they are member of)
create policy "Users can view tenants they belong to"
  on public.tenants for select
  using (
    exists (
      select 1 from public.tenant_users
      where tenant_users.tenant_id = tenants.id
      and tenant_users.user_id = auth.uid()
    )
  );

-- 5. RLS Policies for Data Tables (Generic Function)
-- We'll create a helper function to avoid repetition? No, explicit is better for audit.

-- Listings
alter table public.listings enable row level security;
create policy "tenant_isolation_listings_select" on public.listings
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

create policy "tenant_isolation_listings_insert" on public.listings
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

create policy "tenant_isolation_listings_update" on public.listings
  for update using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

create policy "tenant_isolation_listings_delete" on public.listings
  for delete using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- Bookings
alter table public.bookings enable row level security;
create policy "tenant_isolation_bookings_select" on public.bookings
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_bookings_insert" on public.bookings
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_bookings_update" on public.bookings
  for update using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- Guests
alter table public.guests enable row level security;
create policy "tenant_isolation_guests_select" on public.guests
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_guests_insert" on public.guests
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_guests_update" on public.guests
  for update using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- Messages
alter table public.messages enable row level security;
create policy "tenant_isolation_messages_select" on public.messages
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_messages_insert" on public.messages
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- Wallet Transactions
alter table public.wallet_transactions enable row level security;
create policy "tenant_isolation_wallet_select" on public.wallet_transactions
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
-- Wallet might be read-only for users, but for now apply standard isolation

-- Guest IDs
alter table public.guest_ids enable row level security;
create policy "tenant_isolation_guest_ids_select" on public.guest_ids
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_guest_ids_insert" on public.guest_ids
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- Integrations
alter table public.integrations enable row level security;
create policy "tenant_isolation_integrations_select" on public.integrations
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_integrations_insert" on public.integrations
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_integrations_update" on public.integrations
  for update using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- Payment Records
alter table public.payment_records enable row level security;
create policy "tenant_isolation_payments_select" on public.payment_records
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_payments_insert" on public.payment_records
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_payments_update" on public.payment_records
  for update using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- Listing Calendars
alter table public.listing_calendars enable row level security;
create policy "tenant_isolation_listing_calendars_select" on public.listing_calendars
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_listing_calendars_insert" on public.listing_calendars
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_listing_calendars_update" on public.listing_calendars
  for update using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- Listing Integrations
alter table public.listing_integrations enable row level security;
create policy "tenant_isolation_listing_integrations_select" on public.listing_integrations
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_listing_integrations_insert" on public.listing_integrations
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_listing_integrations_update" on public.listing_integrations
  for update using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- Kaisa Accounts
alter table public.kaisa_accounts enable row level security;
create policy "tenant_isolation_kaisa_accounts_select" on public.kaisa_accounts
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_kaisa_accounts_insert" on public.kaisa_accounts
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_kaisa_accounts_update" on public.kaisa_accounts
  for update using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- AI Usage Events
alter table public.ai_usage_events enable row level security;
create policy "tenant_isolation_ai_usage_events_select" on public.ai_usage_events
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_ai_usage_events_insert" on public.ai_usage_events
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- System Logs
alter table public.system_logs enable row level security;
create policy "tenant_isolation_system_logs_select" on public.system_logs
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_system_logs_insert" on public.system_logs
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- Invoices
alter table public.invoices enable row level security;
create policy "tenant_isolation_invoices_select" on public.invoices
  for select using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_invoices_insert" on public.invoices
  for insert with check (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
create policy "tenant_isolation_invoices_update" on public.invoices
  for update using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));

-- 6. Indexes for Performance (Tenant ID is high cardinality)
create index if not exists idx_listings_tenant on public.listings(tenant_id);
create index if not exists idx_bookings_tenant on public.bookings(tenant_id);
create index if not exists idx_guests_tenant on public.guests(tenant_id);
create index if not exists idx_messages_tenant on public.messages(tenant_id);
