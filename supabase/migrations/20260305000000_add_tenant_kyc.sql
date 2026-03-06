-- Alter tenants table to add KYC columns
ALTER TABLE tenants 
ADD COLUMN kyc_status text DEFAULT 'pending',
ADD COLUMN pan_number text,
ADD COLUMN aadhaar_number text,
ADD COLUMN kyc_verified_at timestamp with time zone;
