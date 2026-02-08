alter table public.integrations
  add column if not exists last_synced_at timestamp with time zone,
  add column if not exists connected_email text,
  add column if not exists connected_name text;

create table if not exists public.google_context (
  user_id uuid references public.users(id) on delete cascade primary key,
  has_gmail_access boolean default false,
  has_calendar_access boolean default false,
  has_business_access boolean default false,
  last_email_sync timestamp with time zone,
  last_calendar_sync timestamp with time zone,
  last_business_sync timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.google_context enable row level security;

create policy "Users can view own google context"
  on public.google_context for select
  using (auth.uid() = user_id);

create policy "Users can insert own google context"
  on public.google_context for insert
  with check (auth.uid() = user_id);

create policy "Users can update own google context"
  on public.google_context for update
  using (auth.uid() = user_id);

create policy "Users can delete own google context"
  on public.google_context for delete
  using (auth.uid() = user_id);
