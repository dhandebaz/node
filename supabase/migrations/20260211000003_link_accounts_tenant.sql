alter table public.accounts 
  add column if not exists tenant_id uuid references public.tenants(id);

create index if not exists idx_accounts_tenant on public.accounts(tenant_id);
