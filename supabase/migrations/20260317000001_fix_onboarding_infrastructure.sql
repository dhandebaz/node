-- Consolidated Infrastructure & Recovery Migration
-- This script reconstructs missing core tables and enums required for the platform.

-- 1. Create Enums (Idempotent)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type_enum') THEN
        CREATE TYPE product_type_enum AS ENUM ('ai_employee', 'space');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status_enum') THEN
        CREATE TYPE kyc_status_enum AS ENUM ('not_started', 'pending', 'verified', 'rejected');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. System Flags (Global Kill Switches)
CREATE TABLE IF NOT EXISTS public.system_flags (
  key TEXT PRIMARY KEY,
  value BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.system_flags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_flags' AND policyname = 'Everyone can read system flags') THEN
        CREATE POLICY "Everyone can read system flags" ON public.system_flags FOR SELECT USING (true);
    END IF;
END $$;

-- Seed initial System Flags
INSERT INTO public.system_flags (key, value, description) VALUES
  ('ai_global_enabled', true, 'Global AI Replies'),
  ('payments_global_enabled', true, 'Global Payment Links'),
  ('bookings_global_enabled', true, 'Global New Bookings'),
  ('messaging_global_enabled', true, 'Global Outbound Messaging'),
  ('sync_global_enabled', true, 'Global Integrations Sync'),
  ('incident_mode_enabled', false, 'System Incident Mode'),
  ('signups_global_enabled', true, 'Global Signups Control')
ON CONFLICT (key) DO NOTHING;

-- 3. Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key TEXT PRIMARY KEY,
  description TEXT,
  is_global_enabled BOOLEAN NOT NULL DEFAULT false,
  tenant_overrides JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feature_flags' AND policyname = 'Everyone can read feature flags') THEN
        CREATE POLICY "Everyone can read feature flags" ON public.feature_flags FOR SELECT USING (true);
    END IF;
END $$;

-- 4. Failures Table (Error Tracking)
CREATE TABLE IF NOT EXISTS public.failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('auth', 'integration', 'payment', 'calendar', 'ai')),
  source TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.failures ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'failures' AND policyname = 'Tenants can view their own failures') THEN
        CREATE POLICY "Tenants can view their own failures" ON public.failures FOR SELECT 
        USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));
    END IF;
END $$;

-- 5. Monetization Infrastructure (Wallets)
CREATE TABLE IF NOT EXISTS public.wallets (
  tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  balance_after NUMERIC,
  type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Wallet Trigger logic
CREATE OR REPLACE FUNCTION public.handle_wallet_transaction()
RETURNS TRIGGER AS $$
DECLARE
  new_balance NUMERIC;
BEGIN
  INSERT INTO public.wallets (tenant_id, balance)
  VALUES (new.tenant_id, 0)
  ON CONFLICT (tenant_id) DO NOTHING;

  UPDATE public.wallets
  SET balance = balance + new.amount, updated_at = now()
  WHERE tenant_id = new.tenant_id
  RETURNING balance INTO new_balance;

  new.balance_after := new_balance;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_wallet_transaction_created') THEN
        CREATE TRIGGER on_wallet_transaction_created
        BEFORE INSERT ON public.wallet_transactions
        FOR EACH ROW EXECUTE FUNCTION public.handle_wallet_transaction();
    END IF;
END $$;

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 6. AI Usage Events
CREATE TABLE IF NOT EXISTS public.ai_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  manager_slug TEXT,
  tokens_used INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_usage_events' AND policyname = 'Tenants can view their own AI usage') THEN
        CREATE POLICY "Tenants can view their own AI usage" ON public.ai_usage_events FOR SELECT 
        USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));
    END IF;
END $$;

-- 7. Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  referred_tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  reward_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(referred_tenant_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 8. Ensure Tenants & Accounts are synchronized
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_branding_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_ai_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_messaging_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_bookings_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_wallet_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS kyc_status kyc_status_enum DEFAULT 'not_started';

ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS onboarding_milestones JSONB DEFAULT '[]'::jsonb;
