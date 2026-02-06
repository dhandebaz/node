
-- Create Datacenters Table
create table if not exists datacenters (
  id text primary key, -- "DC-DEL-01"
  name text not null,
  location text not null,
  total_capacity int not null default 0,
  active_nodes int not null default 0,
  status text not null default 'active' check (status in ('active', 'maintenance', 'offline')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Nodes Table
create table if not exists nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  datacenter_id text references datacenters(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'deploying', 'active', 'paused', 'retired', 'failed')),
  pool text not null default 'Standard',
  unit_value numeric not null default 1000000,
  mou_status text default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  activated_at timestamp with time zone,
  hold_period_end timestamp with time zone
);

-- Enable RLS
alter table datacenters enable row level security;
alter table nodes enable row level security;

-- RLS Policies for Datacenters
-- Everyone can read datacenters (public info)
create policy "Datacenters are viewable by everyone"
  on datacenters for select
  using (true);

-- Only admins can insert/update/delete datacenters
-- Assuming we have a way to check admin role, or we rely on service role for admin actions.
-- For now, allowing authenticated users to read is safe. 
-- Writes should be restricted. Since we use supabaseAdmin for backend logic, RLS applies to client.
-- We can restrict client-side writes to 0 (false) and use service role for admin actions.

create policy "Datacenters are editable by admins only"
  on datacenters for all
  using (false); -- Rely on Service Role for admin mutations

-- RLS Policies for Nodes
-- Users can view their own nodes
create policy "Users can view their own nodes"
  on nodes for select
  using (auth.uid() = user_id);

-- Admins can view all nodes (Service role bypasses RLS, but if we want client access for admins)
-- For now, relying on Service Role for Admin Dashboard is safer and cleaner.

-- Insert Initial Datacenter Data (Okhla Delhi)
insert into datacenters (id, name, location, total_capacity, active_nodes, status)
values 
  ('DC-DEL-01', 'Okhla Phase III', 'New Delhi, India', 180, 6, 'active')
on conflict (id) do update set
  name = excluded.name,
  location = excluded.location,
  total_capacity = excluded.total_capacity;
