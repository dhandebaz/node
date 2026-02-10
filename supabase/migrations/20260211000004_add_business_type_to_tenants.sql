-- Add business_type to tenants table
alter table public.tenants
  add column if not exists business_type text check (business_type in ('airbnb_host', 'kirana_store', 'doctor_clinic', 'thrift_store'));

-- Validation check (optional, but good for data integrity)
-- We can't easily enforce "if product_type = 'ai_employee'" here because product_type is on accounts table, not tenants.
-- So we rely on application logic for that relationship.
