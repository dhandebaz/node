-- Ensure integrations table exists with all required columns
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  scopes TEXT[],
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'disconnected',
  connected_email TEXT,
  connected_name TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  last_sync TIMESTAMP WITH TIME ZONE, -- Legacy support
  error_code TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Constraint to ensure one integration per provider per tenant (or user)
  -- We prefer tenant-scoped integrations for the business
  UNIQUE(tenant_id, provider)
);

-- Add columns if they don't exist (in case table existed with fewer columns)
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS access_token TEXT;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS refresh_token TEXT;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS scopes TEXT[];
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'disconnected';
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS connected_email TEXT;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS connected_name TEXT;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS error_code TEXT;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_integrations_tenant_id ON public.integrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON public.integrations(provider);

-- RLS Policies (Idempotent via DROP IF EXISTS)
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant integrations" ON public.integrations;
CREATE POLICY "Users can view own tenant integrations" ON public.integrations
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own tenant integrations" ON public.integrations;
CREATE POLICY "Users can insert own tenant integrations" ON public.integrations
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own tenant integrations" ON public.integrations;
CREATE POLICY "Users can update own tenant integrations" ON public.integrations
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own tenant integrations" ON public.integrations;
CREATE POLICY "Users can delete own tenant integrations" ON public.integrations
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );
