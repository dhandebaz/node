
-- Kaisa Memories Table
CREATE TABLE IF NOT EXISTS public.kaisa_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('preference', 'process', 'correction', 'outcome')) NOT NULL,
  source TEXT CHECK (source IN ('explicit', 'inferred')) NOT NULL,
  description TEXT NOT NULL,
  confidence NUMERIC DEFAULT 1.0,
  status TEXT CHECK (status IN ('active', 'pending_confirmation', 'archived')) DEFAULT 'active',
  module_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.kaisa_memories ENABLE ROW LEVEL SECURITY;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_kaisa_memories_tenant ON public.kaisa_memories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kaisa_memories_user ON public.kaisa_memories(user_id);

-- RLS Policies
CREATE POLICY "tenant_isolation_kaisa_memories_select" ON public.kaisa_memories
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "tenant_isolation_kaisa_memories_insert" ON public.kaisa_memories
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "tenant_isolation_kaisa_memories_update" ON public.kaisa_memories
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "tenant_isolation_kaisa_memories_delete" ON public.kaisa_memories
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));
