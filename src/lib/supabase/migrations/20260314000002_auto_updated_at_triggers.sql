-- Ensure updated_at is automatically maintained for all public tables that have it

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

do $$
declare
  r record;
begin
  for r in
    select t.table_name
    from information_schema.tables t
    join information_schema.columns c
      on c.table_schema = t.table_schema
     and c.table_name = t.table_name
     and c.column_name = 'updated_at'
    where t.table_schema = 'public'
      and t.table_type = 'BASE TABLE'
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', r.table_name, r.table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      r.table_name,
      r.table_name
    );
  end loop;
end $$;

