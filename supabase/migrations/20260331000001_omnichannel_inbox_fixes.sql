-- Migration: 020_omnichannel_inbox_fixes.sql
-- Fixes for omnichannel inbox to properly link messages to conversations

-- 1. Add conversation_id to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL;

-- 2. Add tenant_id to guests table (required for multi-tenant isolation)
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 3. Add ai_paused flag to guests table
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS ai_paused BOOLEAN DEFAULT FALSE;

-- 4. Update channel constraints to include 'web' and 'messenger'
-- Drop existing check constraints first
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_channel_check;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_channel_check;
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_channel_check;

-- Add updated constraints
ALTER TABLE public.messages ADD CONSTRAINT messages_channel_check CHECK (channel IN ('whatsapp', 'instagram', 'messenger', 'web', 'airbnb', 'voice', 'email'));
ALTER TABLE public.conversations ADD CONSTRAINT conversations_channel_check CHECK (channel IN ('whatsapp', 'instagram', 'messenger', 'web', 'airbnb', 'voice', 'email'));
ALTER TABLE public.guests ADD CONSTRAINT guests_channel_check CHECK (channel IN ('whatsapp', 'instagram', 'messenger', 'web', 'airbnb', 'voice', 'email', 'direct'));

-- 5. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_tenant_id ON public.messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guests_tenant_id ON public.guests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON public.guests(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_external_id ON public.conversations(external_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- 6. Create RLS policies for conversations (if not exists)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_can_view_conversations" ON public.conversations;
CREATE POLICY "tenant_can_view_conversations" ON public.conversations
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
    OR tenant_id = auth.uid()
  );

DROP POLICY IF EXISTS "tenant_can_insert_conversations" ON public.conversations;
CREATE POLICY "tenant_can_insert_conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
    OR tenant_id = auth.uid()
  );

DROP POLICY IF EXISTS "tenant_can_update_conversations" ON public.conversations;
CREATE POLICY "tenant_can_update_conversations" ON public.conversations
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
    OR tenant_id = auth.uid()
  );

-- 7. Create RLS policies for guests (if not exists)
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_can_view_guests" ON public.guests;
CREATE POLICY "tenant_can_view_guests" ON public.guests
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
    OR tenant_id = auth.uid()
  );

DROP POLICY IF EXISTS "tenant_can_insert_guests" ON public.guests;
CREATE POLICY "tenant_can_insert_guests" ON public.guests
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
    OR tenant_id = auth.uid()
  );

DROP POLICY IF EXISTS "tenant_can_update_guests" ON public.guests;
CREATE POLICY "tenant_can_update_guests" ON public.guests
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
    OR tenant_id = auth.uid()
  );

-- 8. Update messages RLS policies
DROP POLICY IF EXISTS "tenant_can_view_messages" ON public.messages;
CREATE POLICY "tenant_can_view_messages" ON public.messages
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
    OR tenant_id = auth.uid()
  );

DROP POLICY IF EXISTS "tenant_can_insert_messages" ON public.messages;
CREATE POLICY "tenant_can_insert_messages" ON public.messages
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
    OR tenant_id = auth.uid()
  );

-- 9. Create service role policies for webhook insertions (bypasses RLS)
-- These are used by the API routes that need to insert messages from webhooks
DROP POLICY IF EXISTS "service_role_can_insert_messages" ON public.messages;
CREATE POLICY "service_role_can_insert_messages" ON public.messages
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_can_insert_guests" ON public.guests;
CREATE POLICY "service_role_can_insert_guests" ON public.guests
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_can_update_conversations" ON public.conversations;
CREATE POLICY "service_role_can_update_conversations" ON public.conversations
  FOR UPDATE TO service_role
  USING (true);

-- 10. Ensure updated_at trigger exists for conversations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
