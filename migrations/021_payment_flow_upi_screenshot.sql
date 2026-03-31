-- Migration: 021_payment_flow_upi_screenshot.sql
-- Adds UPI mobile field and ensures storage buckets for payment screenshots

-- 1. Add upi_mobile column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS upi_mobile TEXT;

-- 2. Create storage bucket for payment-proofs (screenshots)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'payment-proofs') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('payment-proofs', 'payment-proofs', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg']);
  END IF;
END $$;

-- 3. Create storage bucket for business-assets (QR codes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'business-assets') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('business-assets', 'business-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg']);
  END IF;
END $$;

-- 4. Drop and recreate storage policies
DROP POLICY IF EXISTS "Public read access to payment proofs" ON storage.objects;
CREATE POLICY "Public read access to payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Public read access to business assets" ON storage.objects;
CREATE POLICY "Public read access to business assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-assets');

DROP POLICY IF EXISTS "Users can upload business assets" ON storage.objects;
CREATE POLICY "Users can upload business assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-assets' AND 
  auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Service role can upload payment proofs" ON storage.objects;
CREATE POLICY "Service role can upload payment proofs"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Service role can read payment proofs" ON storage.objects;
CREATE POLICY "Service role can read payment proofs"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'payment-proofs');

-- 5. Add RLS policies for payment_links table
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment links" ON public.payment_links;
CREATE POLICY "Users can view own payment links" ON public.payment_links
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
  ) OR tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own payment links" ON public.payment_links;
CREATE POLICY "Users can update own payment links" ON public.payment_links
  FOR UPDATE USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
  ) OR tenant_id = auth.uid());

DROP POLICY IF EXISTS "Public can view payment link status" ON public.payment_links;
CREATE POLICY "Public can view payment link status" ON public.payment_links
  FOR SELECT USING (status IN ('active', 'pending_verification', 'paid'));

-- 6. Create indexes for faster payment link queries
DROP INDEX IF EXISTS idx_payment_links_status;
CREATE INDEX idx_payment_links_status ON public.payment_links(status);

DROP INDEX IF EXISTS idx_payment_links_tenant_status;
CREATE INDEX idx_payment_links_tenant_status ON public.payment_links(tenant_id, status);
