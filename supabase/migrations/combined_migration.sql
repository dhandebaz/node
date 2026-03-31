-- Combined Migration Script for Nodebase Omnichannel Inbox + Unified Customer Profiles
-- Run this in your Supabase SQL Editor

-- =============================================
-- PART 1: OMNICHANNEL INBOX FIXES
-- =============================================

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
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_channel_check;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_channel_check;
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_channel_check;

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

-- 6. Create RLS policies for conversations
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

-- 7. Create RLS policies for guests
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

-- 9. Service role policies for webhook insertions
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

-- =============================================
-- PART 2: PAYMENT FLOW UPI SCREENSHOT
-- =============================================

-- 11. Add upi_mobile column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS upi_mobile TEXT;

-- 12. Create storage bucket for payment-proofs (screenshots)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'payment-proofs') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('payment-proofs', 'payment-proofs', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg']);
  END IF;
END $$;

-- 13. Create storage bucket for business-assets (QR codes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'business-assets') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('business-assets', 'business-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg']);
  END IF;
END $$;

-- 14. Storage policies
DROP POLICY IF EXISTS "Public read access to payment proofs" ON storage.objects;
CREATE POLICY "Public read access to payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Public read access to business assets" ON storage.objects;
CREATE POLICY "Public read access to business assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-assets');

DROP POLICY IF EXISTS "Users can upload business assets" ON storage.objects;
CREATE POLICY "Users can upload business assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-assets' AND 
  auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Service role can upload payment proofs" ON storage.objects;
CREATE POLICY "Service role can upload payment proofs"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Service role can read payment proofs" ON storage.objects;
CREATE POLICY "Service role can read payment proofs"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'payment-proofs');

-- 15. Create indexes for faster payment link queries
DROP INDEX IF EXISTS idx_payment_links_status;
CREATE INDEX idx_payment_links_status ON public.payment_links(status);

DROP INDEX IF EXISTS idx_payment_links_tenant_status;
CREATE INDEX idx_payment_links_tenant_status ON public.payment_links(tenant_id, status);

-- =============================================
-- PART 3: UNIFIED CUSTOMER PROFILES
-- =============================================

-- 16. Create contacts table (unified customer profiles)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Primary identifiers (at least one required)
    phone TEXT,
    email TEXT,
    
    -- Profile data
    name TEXT,
    preferred_name TEXT,
    
    -- Device/location hints (for fuzzy matching)
    last_ip TEXT,
    last_user_agent TEXT,
    
    -- Profiling data
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    customer_type TEXT DEFAULT 'prospect',
    lifetime_value NUMERIC DEFAULT 0,
    
    -- First seen tracking
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata for cross-channel data
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT contacts_identifiers CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- 17. Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS contacts_tenant_phone_idx 
    ON public.contacts(tenant_id, phone) WHERE phone IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS contacts_tenant_email_idx 
    ON public.contacts(tenant_id, email) WHERE email IS NOT NULL;

-- 18. Indexes for lookups
CREATE INDEX IF NOT EXISTS contacts_phone_idx ON public.contacts(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS contacts_email_idx ON public.contacts(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS contacts_tenant_idx ON public.contacts(tenant_id);

-- 19. Add contact_id to guests table
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS guests_contact_idx ON public.guests(contact_id) WHERE contact_id IS NOT NULL;

-- 20. Create guest_identifiers table
CREATE TABLE IF NOT EXISTS public.guest_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    identifier_type TEXT NOT NULL,
    identifier_value TEXT NOT NULL,
    channel TEXT NOT NULL,
    
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, identifier_type, identifier_value)
);

CREATE INDEX IF NOT EXISTS guest_identifiers_contact_idx ON public.guest_identifiers(contact_id);
CREATE INDEX IF NOT EXISTS guest_identifiers_lookup_idx ON public.guest_identifiers(identifier_type, identifier_value);

-- 21. RLS policies for contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;
CREATE POLICY "Users can view own contacts" ON public.contacts
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    ) OR tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own contacts" ON public.contacts;
CREATE POLICY "Users can insert own contacts" ON public.contacts
    FOR INSERT WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    ) OR tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own contacts" ON public.contacts;
CREATE POLICY "Users can update own contacts" ON public.contacts
    FOR UPDATE USING (tenant_id IN (
        SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    ) OR tenant_id = auth.uid());

-- 22. RLS policies for guest_identifiers
ALTER TABLE public.guest_identifiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own guest identifiers" ON public.guest_identifiers;
CREATE POLICY "Users can view own guest identifiers" ON public.guest_identifiers
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    ) OR tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own guest identifiers" ON public.guest_identifiers;
CREATE POLICY "Users can insert own guest identifiers" ON public.guest_identifiers
    FOR INSERT WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    ) OR tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own guest identifiers" ON public.guest_identifiers;
CREATE POLICY "Users can update own guest identifiers" ON public.guest_identifiers
    FOR UPDATE USING (tenant_id IN (
        SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    ) OR tenant_id = auth.uid());

-- 23. Auto-update triggers
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_seen_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS contacts_updated_at ON public.contacts;
CREATE TRIGGER contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_contacts_updated_at();

CREATE OR REPLACE FUNCTION update_guest_identifiers_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS guest_identifiers_last_seen ON public.guest_identifiers;
CREATE TRIGGER guest_identifiers_last_seen
    BEFORE UPDATE ON public.guest_identifiers
    FOR EACH ROW
    EXECUTE FUNCTION update_guest_identifiers_last_seen();

-- 24. Service role policies for contacts and guest_identifiers
DROP POLICY IF EXISTS "Service role can view contacts" ON public.contacts;
CREATE POLICY "Service role can view contacts" ON public.contacts
    FOR SELECT TO service_role USING (true);

DROP POLICY IF EXISTS "Service role can insert contacts" ON public.contacts;
CREATE POLICY "Service role can insert contacts" ON public.contacts
    FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update contacts" ON public.contacts;
CREATE POLICY "Service role can update contacts" ON public.contacts
    FOR UPDATE TO service_role USING (true);

DROP POLICY IF EXISTS "Service role can view guest identifiers" ON public.guest_identifiers;
CREATE POLICY "Service role can view guest identifiers" ON public.guest_identifiers
    FOR SELECT TO service_role USING (true);

DROP POLICY IF EXISTS "Service role can insert guest identifiers" ON public.guest_identifiers;
CREATE POLICY "Service role can insert guest identifiers" ON public.guest_identifiers
    FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update guest identifiers" ON public.guest_identifiers;
CREATE POLICY "Service role can update guest identifiers" ON public.guest_identifiers
    FOR UPDATE TO service_role USING (true);

-- =============================================
-- PART 4: NOTIFICATIONS SYSTEM
-- =============================================

-- 25. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    data JSONB DEFAULT '{}',
    channel TEXT,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. Indexes for notifications
CREATE INDEX IF NOT EXISTS notifications_tenant_idx ON public.notifications(tenant_id);
CREATE INDEX IF NOT EXISTS notifications_tenant_unread_idx ON public.notifications(tenant_id) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS notifications_type_idx ON public.notifications(type);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_contact_idx ON public.notifications(contact_id);

-- 27. RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    ) OR tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (tenant_id IN (
        SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    ) OR tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (tenant_id IN (
        SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    ) OR tenant_id = auth.uid());

-- 28. Service role policies for notifications
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications" ON public.notifications
    FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can view notifications" ON public.notifications;
CREATE POLICY "Service role can view notifications" ON public.notifications
    FOR SELECT TO service_role USING (true);

-- =============================================
-- DONE
-- =============================================
-- All migrations completed successfully!
