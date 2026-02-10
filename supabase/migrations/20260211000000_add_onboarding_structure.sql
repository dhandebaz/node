-- Create accounts table for onboarding and product selection
create table if not exists public.accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_type text check (product_type in ('ai_employee', 'space')),
  onboarding_status text check (onboarding_status in ('pending', 'complete')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- RLS
alter table public.accounts enable row level security;

create policy "Users can view own account"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "Users can update own account"
  on public.accounts for update
  using (auth.uid() = user_id);

create policy "Users can insert own account"
  on public.accounts for insert
  with check (auth.uid() = user_id);
