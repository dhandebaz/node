
-- 1. Create AI Memory Table
CREATE TABLE IF NOT EXISTS public.ai_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE, -- Nullable (Business memories don't have listing)
  memory_type TEXT NOT NULL CHECK (memory_type IN ('business', 'listing', 'interaction')),
  summary TEXT NOT NULL,
  confidence NUMERIC DEFAULT 1.0,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb -- Flexible storage for context tags, source, guest_id etc.
);

-- 2. Enable RLS
ALTER TABLE public.ai_memory ENABLE ROW LEVEL SECURITY;

-- 3. Policies

-- Select: Tenant users can view their own memories
CREATE POLICY "Tenant users can view own memories" ON public.ai_memory
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- Insert: Tenant users can insert their own memories
CREATE POLICY "Tenant users can insert own memories" ON public.ai_memory
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- Update: Tenant users can update their own memories
CREATE POLICY "Tenant users can update own memories" ON public.ai_memory
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- Delete: Tenant users can delete their own memories
CREATE POLICY "Tenant users can delete own memories" ON public.ai_memory
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_ai_memory_tenant ON public.ai_memory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_listing ON public.ai_memory(listing_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_type ON public.ai_memory(memory_type);

-- 5. Add "Memory Read/Write" Cost to Pricing Rules (if not exists)
-- This is a data migration for system_settings. 
-- We'll handle this in the application logic default or update it here if possible.
-- For now, we assume the PricingService defaults will handle it or we update it via Admin UI.
