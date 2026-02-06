
create table if not exists kaisa_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null unique,
  business_type text not null,
  role text not null check (role in ('manager', 'co-founder')),
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists kaisa_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  intent text not null,
  status text not null default 'queued' check (status in ('queued', 'in_progress', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- RLS Policies (Optional but good practice, though we are using admin client mostly for now)
alter table kaisa_accounts enable row level security;
alter table kaisa_tasks enable row level security;

-- Policy for users to read their own account
create policy "Users can view own kaisa account" 
on kaisa_accounts for select 
using (auth.uid() = user_id);

-- Policy for users to read their own tasks
create policy "Users can view own kaisa tasks" 
on kaisa_tasks for select 
using (auth.uid() = user_id);
