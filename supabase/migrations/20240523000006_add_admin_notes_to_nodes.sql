
-- Add admin_notes column to nodes table
alter table nodes add column if not exists admin_notes text[] default array[]::text[];
