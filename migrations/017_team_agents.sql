
-- Migration 017: Multi-Agent Teams
-- Infrastructure for multiple specialized AI agents per tenant.

CREATE TABLE IF NOT EXISTS public.team_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- e.g. 'Frontdesk', 'Ops', 'Concierge'
  description TEXT,
  avatar_url TEXT,
  instructions TEXT, -- Specialized instructions for this agent
  personality TEXT, -- Personality description
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.team_agents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "tenant_isolation_team_agents" ON public.team_agents
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_agents_tenant ON public.team_agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_team_agents_status ON public.team_agents(status);

-- Seed default agent for existing tenants
INSERT INTO public.team_agents (tenant_id, name, role, instructions, personality)
SELECT id, 'Kaisa', 'General Assistant', 'Help guests with general queries.', 'Professional and helpful'
FROM public.tenants
ON CONFLICT DO NOTHING;
