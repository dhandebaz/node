
-- 1. Add Growth Columns to Tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_branding_enabled BOOLEAN DEFAULT FALSE;

-- 2. Create Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  referred_tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, active, rewarded
  reward_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(referred_tenant_id) -- One referrer per tenant
);

-- 3. Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 4. Policies

-- Referrer can view their referrals
CREATE POLICY "Referrer can view their referrals" ON public.referrals
  FOR SELECT USING (
    referrer_tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- Admin can view all
-- (Assuming admin policies are handled globally or via service role)

-- 5. Index for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_referral_code ON public.tenants(referral_code);

-- 6. Function to generate referral code on tenant creation (optional, or handled in app)
-- We'll handle it in the app logic to keep DB simple, or use a trigger if we want to guarantee it.
-- Let's stick to app logic for code generation (e.g. name-based or random).
