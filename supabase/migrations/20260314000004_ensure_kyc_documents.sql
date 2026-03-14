-- Ensure KYC documents table exists (idempotent)

create table if not exists public.kyc_documents (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  document_type text check (document_type in ('pan', 'aadhaar', 'gst', 'business_license')) not null,
  file_path text not null,
  extracted_data jsonb default '{}'::jsonb,
  status text check (status in ('pending', 'processed', 'failed', 'verified')) default 'pending',
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.kyc_documents enable row level security;

do $$ begin
  create policy "tenant_isolation_kyc_documents" on public.kyc_documents
    for all using (tenant_id in (select tenant_id from public.tenant_users where user_id = auth.uid()));
exception when duplicate_object then null;
end $$;

create index if not exists idx_kyc_documents_tenant on public.kyc_documents(tenant_id);
create index if not exists idx_kyc_documents_status on public.kyc_documents(status);

