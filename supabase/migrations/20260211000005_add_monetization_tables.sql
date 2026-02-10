
-- 1. Add subscription_plan to tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- 2. Create Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE PRIMARY KEY,
  balance NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL, -- Negative for deduction, Positive for top-up
  type TEXT NOT NULL, -- 'ai_usage', 'top_up', 'refund', 'bonus'
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Store details like { action_type: 'reply', tokens: 150 }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create System Settings Table (for Admin Pricing)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES public.users(id)
);

-- 5. Insert Default Pricing Settings
INSERT INTO public.system_settings (key, value)
VALUES (
  'pricing_rules', 
  '{
    "per_1k_tokens": 0.002, 
    "action_multipliers": {
      "ai_reply": 1.0,
      "calendar_sync": 0.5,
      "availability_check": 2.0
    }
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- 6. Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 7. Policies

-- Wallets: Tenant Users can view their own wallet
CREATE POLICY "Tenant users can view own wallet" ON public.wallets
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- Wallet Transactions: Tenant Users can view their own transactions
CREATE POLICY "Tenant users can view own wallet transactions" ON public.wallet_transactions
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- System Settings: Authenticated users can read pricing (needed for UI estimation maybe? or just admin?)
-- Let's allow read for all authenticated for transparency, but write only for admins (handled by service role usually or specific policy)
CREATE POLICY "Authenticated users can read system settings" ON public.system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger to update wallet balance on transaction
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (tenant_id, balance, updated_at)
  VALUES (NEW.tenant_id, NEW.amount, NOW())
  ON CONFLICT (tenant_id)
  DO UPDATE SET 
    balance = public.wallets.balance + NEW.amount,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wallet_balance
AFTER INSERT ON public.wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance();

-- Initial Wallet Creation for existing tenants (if any)
INSERT INTO public.wallets (tenant_id, balance)
SELECT id, 100 -- Give 100 free credits to existing tenants
FROM public.tenants
ON CONFLICT (tenant_id) DO NOTHING;
