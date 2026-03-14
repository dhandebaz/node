-- Add updated_at to tenants (idempotent) and keep it in sync automatically

alter table public.tenants
  add column if not exists updated_at timestamp with time zone;

update public.tenants
set updated_at = coalesce(updated_at, created_at, timezone('utc'::text, now()))
where updated_at is null;

alter table public.tenants
  alter column updated_at set default timezone('utc'::text, now());

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tenants_updated_at on public.tenants;
create trigger set_tenants_updated_at
before update on public.tenants
for each row
execute function public.set_updated_at();

