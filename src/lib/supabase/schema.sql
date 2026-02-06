-- Create profiles table
create table if not exists public.profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies (Adjust as needed)
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = user_id);

create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role in ('admin', 'superadmin')
    )
  );
