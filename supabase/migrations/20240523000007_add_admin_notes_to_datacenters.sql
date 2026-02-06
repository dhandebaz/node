
-- Add admin_notes column to datacenters table
alter table datacenters add column if not exists admin_notes text[] default array[]::text[];
