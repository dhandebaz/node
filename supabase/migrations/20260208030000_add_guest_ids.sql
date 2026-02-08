alter table bookings
  add column if not exists id_status text default 'not_requested';

create table if not exists guest_ids (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  guest_name text not null,
  id_type text not null,
  status text default 'requested',
  requested_at timestamp with time zone default timezone('utc'::text, now()),
  uploaded_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  front_image_path text,
  back_image_path text,
  upload_token text unique,
  rejection_reason text
);

alter table guest_ids enable row level security;

create policy "Users can view own guest IDs"
  on guest_ids for select
  using (
    exists (
      select 1
      from bookings
      join listings on listings.id = bookings.listing_id
      where bookings.id = guest_ids.booking_id
        and listings.host_id = auth.uid()
    )
  );

create policy "Users can update own guest IDs"
  on guest_ids for update
  using (
    exists (
      select 1
      from bookings
      join listings on listings.id = bookings.listing_id
      where bookings.id = guest_ids.booking_id
        and listings.host_id = auth.uid()
    )
  );
