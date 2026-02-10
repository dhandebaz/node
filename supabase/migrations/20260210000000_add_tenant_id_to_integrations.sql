-- Add tenant_id to integrations table
ALTER TABLE public.integrations 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Create index for tenant_id in integrations
CREATE INDEX IF NOT EXISTS idx_integrations_tenant_id ON public.integrations(tenant_id);

-- Add tenant_id to google_context table
ALTER TABLE public.google_context
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Create index for tenant_id in google_context
CREATE INDEX IF NOT EXISTS idx_google_context_tenant_id ON public.google_context(tenant_id);

-- Update RLS policies for integrations to use tenant_id
DROP POLICY IF EXISTS "Users can view own integrations" ON public.integrations;
CREATE POLICY "Users can view own tenant integrations" ON public.integrations
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own integrations" ON public.integrations;
CREATE POLICY "Users can insert own tenant integrations" ON public.integrations
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own integrations" ON public.integrations;
CREATE POLICY "Users can update own tenant integrations" ON public.integrations
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own integrations" ON public.integrations;
CREATE POLICY "Users can delete own tenant integrations" ON public.integrations
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- Update RLS policies for google_context to use tenant_id
DROP POLICY IF EXISTS "Users can view own google context" ON public.google_context;
CREATE POLICY "Users can view own tenant google context" ON public.google_context
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own google context" ON public.google_context;
CREATE POLICY "Users can insert own tenant google context" ON public.google_context
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own google context" ON public.google_context;
CREATE POLICY "Users can update own tenant google context" ON public.google_context
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own google context" ON public.google_context;
CREATE POLICY "Users can delete own tenant google context" ON public.google_context
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );
