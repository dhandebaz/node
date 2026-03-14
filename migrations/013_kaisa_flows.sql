
-- Migration 013: Visual Flow Builder & Custom AI Logic
-- Infrastructure for user-defined "If-This-Then-That" logic for Kaisa.

CREATE TABLE IF NOT EXISTS public.kaisa_flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT CHECK (trigger_type IN ('message_received', 'booking_confirmed', 'payment_failed', 'manual_trigger')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'draft', 'archived')) DEFAULT 'draft',
  nodes JSONB DEFAULT '[]'::jsonb, -- Array of flow nodes
  edges JSONB DEFAULT '[]'::jsonb, -- Connections between nodes
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flow Execution Logs (For debugging and visibility)
CREATE TABLE IF NOT EXISTS public.flow_execution_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  flow_id UUID REFERENCES public.kaisa_flows(id) ON DELETE CASCADE,
  trigger_data JSONB NOT NULL,
  execution_steps JSONB DEFAULT '[]'::jsonb,
  status TEXT CHECK (status IN ('success', 'failed', 'halted')) NOT NULL,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.kaisa_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_execution_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "tenant_isolation_kaisa_flows" ON public.kaisa_flows
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "tenant_isolation_flow_execution_logs" ON public.flow_execution_logs
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kaisa_flows_tenant ON public.kaisa_flows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_flow_execution_logs_flow ON public.flow_execution_logs(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_execution_logs_status ON public.flow_execution_logs(status);
