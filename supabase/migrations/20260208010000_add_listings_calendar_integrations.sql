alter table public.listings
  add column if not exists name text,
  add column if not exists city text,
  add column if not exists listing_type text,
  add column if not exists timezone text default 'Asia/Kolkata',
  add column if not exists status text default 'incomplete',
  add column if not exists internal_notes text;

create table if not exists public.listing_integrations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade not null,
  platform text not null,
  external_ical_url text,
  last_synced_at timestamp with time zone,
  status text default 'not_connected',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint listing_platform_unique unique (listing_id, platform)
);

create table if not exists public.listing_calendars (
  listing_id uuid references public.listings(id) on delete cascade primary key,
  nodebase_ical_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.listing_integrations enable row level security;
alter table public.listing_calendars enable row level security;

create policy "Users can view own listing integrations"
  on public.listing_integrations for select
  using (
    exists (select 1 from public.listings where listings.id = listing_integrations.listing_id and listings.host_id = auth.uid())
  );

create policy "Users can insert own listing integrations"
  on public.listing_integrations for insert
  with check (
    exists (select 1 from public.listings where listings.id = listing_integrations.listing_id and listings.host_id = auth.uid())
  );

create policy "Users can update own listing integrations"
  on public.listing_integrations for update
  using (
    exists (select 1 from public.listings where listings.id = listing_integrations.listing_id and listings.host_id = auth.uid())
  );

create policy "Users can delete own listing integrations"
  on public.listing_integrations for delete
  using (
    exists (select 1 from public.listings where listings.id = listing_integrations.listing_id and listings.host_id = auth.uid())
  );

create policy "Users can view own listing calendars"
  on public.listing_calendars for select
  using (
    exists (select 1 from public.listings where listings.id = listing_calendars.listing_id and listings.host_id = auth.uid())
  );

create policy "Users can insert own listing calendars"
  on public.listing_calendars for insert
  with check (
    exists (select 1 from public.listings where listings.id = listing_calendars.listing_id and listings.host_id = auth.uid())
  );

create policy "Users can update own listing calendars"
  on public.listing_calendars for update
  using (
    exists (select 1 from public.listings where listings.id = listing_calendars.listing_id and listings.host_id = auth.uid())
  );

create policy "Users can delete own listing calendars"
  on public.listing_calendars for delete
  using (
    exists (select 1 from public.listings where listings.id = listing_calendars.listing_id and listings.host_id = auth.uid())
  );
