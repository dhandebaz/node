-- Create Legal storage bucket (private) + agreements table

insert into storage.buckets (id, name, public)
values ('legal', 'legal', false)
on conflict (id) do nothing;

create table if not exists public.tenant_legal_agreements (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  version text not null,
  file_path text not null,
  sha256 text not null,
  signed_at timestamptz default now() not null,
  signer_email text,
  signer_ip text,
  signer_user_agent text,
  created_at timestamptz default now() not null
);

alter table public.tenant_legal_agreements enable row level security;

do $$ begin
  create policy "tenant_isolation_tenant_legal_agreements" on public.tenant_legal_agreements
    for all using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
exception when duplicate_object then null;
end $$;

create index if not exists idx_tenant_legal_agreements_tenant on public.tenant_legal_agreements(tenant_id);
create index if not exists idx_tenant_legal_agreements_user on public.tenant_legal_agreements(user_id);

