-- V2 CONSOLIDATED UPGRADES (007 to 018)
-- This script consolidates all V2 features into a single migration to prevent dependency errors.
-- Features: Kaisa Memory, Atomic AI Usage, BYOK Settings, Omnichannel Inbox, Voice, Growth Engine, Dynamic Pricing, Flow Builder, KYC OCR, RAG 2.0, Payment Links, Multi-Agent Teams, and Unified Guest Portal.

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Kaisa Memories (Migration 007)
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

-- 3. Atomic AI Usage Recording (Migration 008)
CREATE OR REPLACE FUNCTION public.record_ai_usage_v1(
  p_tenant_id UUID,
  p_amount NUMERIC,
  p_action_type TEXT,
  p_model TEXT,
  p_tokens_used INTEGER,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_txn_id UUID;
  v_usage_id UUID;
BEGIN
  INSERT INTO public.wallet_transactions (tenant_id, amount, type, description, metadata)
  VALUES (p_tenant_id, p_amount, 'ai_usage', 'Usage: ' || p_action_type, 
    jsonb_build_object('action_type', p_action_type, 'model', p_model, 'tokens', p_tokens_used) || p_metadata)
  RETURNING id INTO v_txn_id;

  INSERT INTO public.ai_usage_events (tenant_id, action_type, tokens_used, credits_deducted, model, metadata)
  VALUES (p_tenant_id, p_action_type, p_tokens_used, ABS(p_amount), p_model, p_metadata)
  RETURNING id INTO v_usage_id;

  RETURN jsonb_build_object('success', true, 'transaction_id', v_txn_id, 'usage_event_id', v_usage_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'code', SQLSTATE);
END;
$$;

-- 4. Tenant AI Settings (Migration 009)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{
  "provider": "google",
  "model": "gemini-1.5-flash",
  "apiKey": null,
  "customInstructions": null,
  "tone": "friendly"
}'::jsonb;

-- 5. Omnichannel Inbox & Voice (Migration 010)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT,
  channel TEXT CHECK (channel IN ('whatsapp', 'instagram', 'airbnb', 'voice', 'email')) NOT NULL,
  contact_name TEXT,
  contact_avatar TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS channel TEXT CHECK (channel IN ('whatsapp', 'instagram', 'airbnb', 'voice', 'email')),
ADD COLUMN IF NOT EXISTS direction TEXT CHECK (direction IN ('inbound', 'outbound')),
ADD COLUMN IF NOT EXISTS external_id TEXT;

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

-- 6. Autonomous Growth Engine (Migration 011)
CREATE TABLE IF NOT EXISTS public.growth_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('availability_gap', 'abandoned_inquiry', 'loyalty_upsell', 'review_boost')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'draft')) DEFAULT 'draft',
  trigger_config JSONB DEFAULT '{}'::jsonb,
  message_template TEXT,
  auto_send BOOLEAN DEFAULT false,
  stats JSONB DEFAULT '{"total_reached": 0, "total_responses": 0, "total_conversions": 0, "revenue_generated": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lead_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.growth_campaigns(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  opportunity_type TEXT NOT NULL,
  suggested_message TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'sent', 'ignored')) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Dynamic Pricing (Migration 012)
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS dynamic_pricing_settings JSONB DEFAULT '{
  "enabled": false,
  "min_price": 0,
  "max_price": 10000,
  "strategy": "balanced",
  "weekend_markup": 1.2,
  "last_minute_discount": 0.8
}'::jsonb;

CREATE TABLE IF NOT EXISTS public.listing_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  price NUMERIC NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.price_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  suggested_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  confidence NUMERIC DEFAULT 0.8,
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'applied', 'ignored')) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Visual Flow Builder (Migration 013)
CREATE TABLE IF NOT EXISTS public.kaisa_flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT CHECK (trigger_type IN ('message_received', 'booking_confirmed', 'payment_failed', 'manual_trigger')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'draft', 'archived')) DEFAULT 'draft',
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- 9. KYC Extraction (Migration 014)
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT CHECK (document_type IN ('pan', 'aadhaar', 'gst', 'business_license')) NOT NULL,
  file_path TEXT NOT NULL,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  status TEXT CHECK (status IN ('pending', 'processed', 'failed', 'verified')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Knowledge Base RAG (Migration 015)
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'active', 'failed')) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.knowledge_documents(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(768),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT,
  p_tenant_id UUID
)
RETURNS TABLE (id UUID, document_id UUID, content TEXT, similarity FLOAT, metadata JSONB)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT kc.id, kc.document_id, kc.content, 1 - (kc.embedding <=> query_embedding) AS similarity, kc.metadata
  FROM public.knowledge_chunks kc
  WHERE kc.tenant_id = p_tenant_id AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding LIMIT match_count;
END;
$$;

-- 11. Payment Links (Migration 016)
CREATE TABLE IF NOT EXISTS public.payment_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT CHECK (status IN ('active', 'paid', 'expired', 'cancelled')) DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  external_order_id TEXT,
  payment_method TEXT CHECK (payment_method IN ('gateway', 'business_qr')) DEFAULT 'gateway',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Multi-Agent Teams (Migration 017)
CREATE TABLE IF NOT EXISTS public.team_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  instructions TEXT,
  personality TEXT,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default agent
INSERT INTO public.team_agents (tenant_id, name, role, instructions, personality)
SELECT id, 'Kaisa', 'General Assistant', 'Help guests with general queries.', 'Professional and helpful'
FROM public.tenants
ON CONFLICT DO NOTHING;

-- 13. Unified Guest Portal & Business QR (Migration 018)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS business_qr_url TEXT,
ADD COLUMN IF NOT EXISTS upi_id TEXT;

CREATE TABLE IF NOT EXISTS public.guest_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  payment_link_id UUID REFERENCES public.payment_links(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  arrival_time TEXT,
  special_requests TEXT,
  num_guests INTEGER DEFAULT 1,
  id_verified BOOLEAN DEFAULT false,
  id_document_id UUID REFERENCES public.kyc_documents(id),
  status TEXT CHECK (status IN ('pending', 'completed', 'verified')) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. RLS & Security (Combined)
ALTER TABLE public.kaisa_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaisa_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_checkins ENABLE ROW LEVEL SECURITY;

-- Shared Tenant Isolation Policy (Reusable logic)
DO $$ 
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
    AND table_name IN ('kaisa_memories', 'conversations', 'voice_agents', 'growth_campaigns', 
                       'lead_opportunities', 'listing_price_history', 'price_suggestions', 
                       'kaisa_flows', 'flow_execution_logs', 'kyc_documents', 'knowledge_documents', 
                       'knowledge_chunks', 'payment_links', 'team_agents', 'guest_checkins')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_%I ON public.%I', t, t);
    EXECUTE format('CREATE POLICY tenant_isolation_%I ON public.%I FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()))', t, t);
  END LOOP;
END $$;

-- Public Guest Portal Access
DROP POLICY IF EXISTS public_guest_access ON public.guest_checkins;
CREATE POLICY "public_guest_access" ON public.guest_checkins FOR ALL USING (true) WITH CHECK (true);

-- 15. Indexes (Combined)
CREATE INDEX IF NOT EXISTS idx_kaisa_memories_tenant ON public.kaisa_memories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON public.conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_voice_agents_tenant ON public.voice_agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_growth_campaigns_tenant ON public.growth_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_price_history_listing ON public.listing_price_history(listing_id, date);
CREATE INDEX IF NOT EXISTS idx_kaisa_flows_tenant ON public.kaisa_flows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_tenant ON public.kyc_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON public.knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_payment_links_tenant ON public.payment_links(tenant_id);
CREATE INDEX IF NOT EXISTS idx_guest_checkins_tenant ON public.guest_checkins(tenant_id);
