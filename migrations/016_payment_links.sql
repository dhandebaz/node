
-- Migration 016: Smart Booking Links (Pay-per-Reply)
-- Infrastructure for secure, temporary checkout links generated during conversations.

-- 1. Payment Links Table
CREATE TABLE IF NOT EXISTS public.payment_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT CHECK (status IN ('active', 'paid', 'expired', 'cancelled')) DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- e.g. { "start_date": "...", "end_date": "..." }
  external_order_id TEXT, -- Razorpay/Stripe order ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "tenant_isolation_payment_links" ON public.payment_links
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

-- Index for lookup
CREATE INDEX IF NOT EXISTS idx_payment_links_tenant ON public.payment_links(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_conversation ON public.payment_links(conversation_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON public.payment_links(status);
