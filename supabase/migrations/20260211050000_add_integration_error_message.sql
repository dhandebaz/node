alter table public.listing_integrations
add column if not exists error_message text;
