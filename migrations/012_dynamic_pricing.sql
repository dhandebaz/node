
-- Migration 012: Dynamic Pricing & Revenue Optimization
-- Infrastructure for AI-driven nightly rate adjustments and pricing history.

-- 1. Add Dynamic Pricing Settings to Listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS dynamic_pricing_settings JSONB DEFAULT '{
  "enabled": false,
  "min_price": 0,
  "max_price": 10000,
  "strategy": "balanced",
  "weekend_markup": 1.2,
  "last_minute_discount": 0.8
}'::jsonb;

-- 2. Price History (Audit trail of what price was set when)
CREATE TABLE IF NOT EXISTS public.listing_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  price NUMERIC NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Price Suggestions (AI-generated ideas for the user to approve)
CREATE TABLE IF NOT EXISTS public.price_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  suggested_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  confidence NUMERIC DEFAULT 0.8,
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'applied', 'ignored')) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.listing_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_suggestions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "tenant_isolation_price_history" ON public.listing_price_history
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "tenant_isolation_price_suggestions" ON public.price_suggestions
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_price_history_listing ON public.listing_price_history(listing_id, date);
CREATE INDEX IF NOT EXISTS idx_price_suggestions_listing ON public.price_suggestions(listing_id, date);
CREATE INDEX IF NOT EXISTS idx_price_suggestions_status ON public.price_suggestions(status);
