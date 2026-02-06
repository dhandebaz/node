
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id text not null, -- Store the user ID of the admin
  target_resource text not null, -- 'datacenter', 'node', 'user', etc.
  target_id text not null,
  action_type text not null,
  details text,
  previous_value text,
  new_value text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table admin_audit_logs enable row level security;

-- Only admins can view logs
create policy "Admins can view audit logs"
  on admin_audit_logs for select
  using (false); -- Service role only for now

-- Only admins can insert logs
create policy "Admins can insert audit logs"
  on admin_audit_logs for insert
  with check (false); -- Service role only
