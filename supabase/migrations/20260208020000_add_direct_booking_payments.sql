alter table bookings
  add column if not exists guest_contact text,
  add column if not exists amount numeric default 0,
  add column if not exists payment_id uuid,
  alter column status set default 'draft';

create table if not exists payment_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  provider text not null,
  status text default 'not_set',
  onboarding_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint payment_accounts_user_provider_unique unique (user_id, provider)
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete set null,
  provider text not null,
  amount numeric default 0,
  status text default 'pending',
  payment_link text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table payment_accounts enable row level security;
alter table payments enable row level security;

create policy "Users can view own payment accounts"
  on payment_accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert own payment accounts"
  on payment_accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own payment accounts"
  on payment_accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete own payment accounts"
  on payment_accounts for delete
  using (auth.uid() = user_id);

create policy "Users can view own payments"
  on payments for select
  using (
    exists (
      select 1
      from bookings
      join listings on listings.id = bookings.listing_id
      where bookings.id = payments.booking_id
        and listings.host_id = auth.uid()
    )
  );
