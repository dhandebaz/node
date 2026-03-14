
-- Migration 014: AI-Powered KYC Extraction
-- Infrastructure for OCR-based identity verification.

CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT CHECK (document_type IN ('pan', 'aadhaar', 'gst', 'business_license')) NOT NULL,
  file_path TEXT NOT NULL, -- Storage bucket path
  extracted_data JSONB DEFAULT '{}'::jsonb,
  status TEXT CHECK (status IN ('pending', 'processed', 'failed', 'verified')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "tenant_isolation_kyc_documents" ON public.kyc_documents
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kyc_documents_tenant ON public.kyc_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON public.kyc_documents(status);
