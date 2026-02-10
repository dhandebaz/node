create table if not exists referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_tenant_id uuid references tenants(id) on delete cascade not null,
  referred_tenant_id uuid references tenants(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  status text default 'pending' check (status in ('pending', 'converted', 'rewarded')),
  reward_amount integer default 0,
  
  unique(referred_tenant_id)
);

-- Add RLS policies
alter table referrals enable row level security;

-- Referrers can view their own referrals
create policy "Referrers can view their referrals"
  on referrals for select
  using (auth.uid() in (
    select user_id from tenant_users where tenant_id = referrer_tenant_id
  ));

-- Admins can view all (handled by service role usually, but good to have)
create policy "Admins can view all referrals"
  on referrals for select
  using (
    exists (
      select 1 from admin_users where id = auth.uid()
    )
  );
