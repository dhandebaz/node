
-- Migration 010: Omnichannel Inbox & Voice Capabilities

-- 1. Create Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT, -- WhatsApp number, Instagram ID, etc.
  channel TEXT CHECK (channel IN ('whatsapp', 'instagram', 'airbnb', 'voice', 'email')) NOT NULL,
  contact_name TEXT,
  contact_avatar TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update Messages Table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS channel TEXT CHECK (channel IN ('whatsapp', 'instagram', 'airbnb', 'voice', 'email')),
ADD COLUMN IF NOT EXISTS direction TEXT CHECK (direction IN ('inbound', 'outbound')),
ADD COLUMN IF NOT EXISTS external_id TEXT;

-- 3. Create Voice Agents Table
CREATE TABLE IF NOT EXISTS public.voice_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  provider TEXT CHECK (provider IN ('vapi', 'retell')) NOT NULL,
  external_agent_id TEXT,
  phone_number TEXT,
  voice_id TEXT,
  instructions TEXT,
  status TEXT DEFAULT 'inactive',
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_agents ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON public.conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON public.conversations(channel);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_voice_agents_tenant ON public.voice_agents(tenant_id);

-- RLS Policies
CREATE POLICY "tenant_isolation_conversations_select" ON public.conversations
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "tenant_isolation_conversations_insert" ON public.conversations
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "tenant_isolation_voice_agents_select" ON public.voice_agents
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "tenant_isolation_voice_agents_all" ON public.voice_agents
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));
