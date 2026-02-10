-- Create Wallets Table
create table if not exists wallets (
  tenant_id uuid primary key references tenants(id) on delete cascade,
  balance numeric not null default 0,
  updated_at timestamp with time zone default now()
);

-- Create Wallet Transactions Table
create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  amount numeric not null, -- Can be negative for deductions
  balance_after numeric, -- Snapshot of balance after transaction
  type text not null, -- 'ai_usage', 'top_up', 'admin_adjustment', 'subscription_renewal'
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Function to update wallet balance on transaction insert
create or replace function handle_wallet_transaction()
returns trigger as $$
declare
  new_balance numeric;
begin
  -- Ensure wallet exists
  insert into wallets (tenant_id, balance)
  values (new.tenant_id, 0)
  on conflict (tenant_id) do nothing;

  -- Update balance and get new value
  update wallets
  set 
    balance = balance + new.amount,
    updated_at = now()
  where tenant_id = new.tenant_id
  returning balance into new_balance;

  -- Set the snapshot balance on the transaction record
  new.balance_after := new_balance;
  
  return new;
end;
$$ language plpgsql;

-- Use BEFORE INSERT to set the balance_after
drop trigger if exists on_wallet_transaction_created on wallet_transactions;
create trigger on_wallet_transaction_created
before insert on wallet_transactions
for each row
execute function handle_wallet_transaction();

-- Add Subscription Columns to Tenants if not exist
alter table tenants 
add column if not exists subscription_plan text default 'starter',
add column if not exists subscription_status text default 'active',
add column if not exists business_type text default 'airbnb_host';

-- System Settings Table (Key-Value Store for Admin)
create table if not exists system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default now(),
  updated_by uuid references auth.users(id)
);

-- Admin Audit Logs
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id),
  target_resource text not null,
  target_id text,
  action_type text not null,
  details text,
  previous_value text,
  new_value text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table wallets enable row level security;
alter table wallet_transactions enable row level security;
alter table system_settings enable row level security;
alter table admin_audit_logs enable row level security;

-- Policies

-- Wallets
create policy "Tenants can view own wallet"
  on wallets for select
  using (auth.uid() in (select user_id from tenant_users where tenant_id = wallets.tenant_id));

-- Wallet Transactions
create policy "Tenants can view own transactions"
  on wallet_transactions for select
  using (auth.uid() in (select user_id from tenant_users where tenant_id = wallet_transactions.tenant_id));

-- System Settings
create policy "Everyone can read system settings"
  on system_settings for select
  using (true); -- Usually public or authenticated, for pricing rules etc.

-- Admin Audit Logs
create policy "Admins can view audit logs"
  on admin_audit_logs for select
  using (exists (select 1 from users where id = auth.uid() and role = 'admin')); -- Assuming user role check
