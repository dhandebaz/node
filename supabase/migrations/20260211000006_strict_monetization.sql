
-- 1. Create AI Usage Events Table (Strict Requirement Part 3)
CREATE TABLE IF NOT EXISTS public.ai_usage_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL, -- 'ai_reply', 'availability_check', etc.
  tokens_used INTEGER NOT NULL,
  credits_deducted NUMERIC NOT NULL,
  model TEXT, -- 'gemini-pro', etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

-- Policy: Tenant users can view their own usage
CREATE POLICY "Tenant users can view own usage events" ON public.ai_usage_events
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- 2. Enforce Non-Negative Balance (Strict Requirement Part 10 & 4)
-- We add a check constraint to the wallets table.
-- This ensures that the trigger update will fail if balance drops below 0,
-- causing the transaction insert to rollback.
ALTER TABLE public.wallets 
ADD CONSTRAINT wallets_balance_non_negative CHECK (balance >= 0);

-- 3. Add Index for Analytics
CREATE INDEX IF NOT EXISTS idx_ai_usage_tenant_date ON public.ai_usage_events(tenant_id, created_at);
