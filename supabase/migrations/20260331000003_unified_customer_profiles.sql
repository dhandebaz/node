-- Migration: 022_unified_customer_profiles.sql
-- Creates contacts table for cross-channel customer identity resolution

-- 1. Create contacts table (unified customer profiles)
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
    customer_type TEXT DEFAULT 'prospect', -- prospect, lead, customer, vip
    lifetime_value NUMERIC DEFAULT 0,
    
    -- First seen tracking
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata for cross-channel data
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT contacts_identifiers CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- 2. Create unique constraint on tenant + phone and tenant + email
CREATE UNIQUE INDEX IF NOT EXISTS contacts_tenant_phone_idx 
    ON public.contacts(tenant_id, phone) WHERE phone IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS contacts_tenant_email_idx 
    ON public.contacts(tenant_id, email) WHERE email IS NOT NULL;

-- 3. Indexes for lookups
CREATE INDEX IF NOT EXISTS contacts_phone_idx ON public.contacts(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS contacts_email_idx ON public.contacts(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS contacts_tenant_idx ON public.contacts(tenant_id);

-- 4. Add contact_id to guests table (links channel-specific guests to unified profile)
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS guests_contact_idx ON public.guests(contact_id) WHERE contact_id IS NOT NULL;

-- 5. Create guest_identifiers table for cross-referencing
CREATE TABLE IF NOT EXISTS public.guest_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Identifier type and value
    identifier_type TEXT NOT NULL, -- phone, email, whatsapp_id, telegram_id, instagram_id, etc.
    identifier_value TEXT NOT NULL,
    
    -- Channel info
    channel TEXT NOT NULL, -- whatsapp, telegram, instagram, web, airbnb, etc.
    
    -- When first seen on this channel
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, identifier_type, identifier_value)
);

CREATE INDEX IF NOT EXISTS guest_identifiers_contact_idx ON public.guest_identifiers(contact_id);
CREATE INDEX IF NOT EXISTS guest_identifiers_lookup_idx ON public.guest_identifiers(identifier_type, identifier_value);

-- 6. Add RLS policies
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

-- 7. Auto-update updated_at trigger
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

-- 8. Auto-update last_seen_at on guest_identifiers
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

-- 9. Service role policies for webhook access
CREATE POLICY "Service role can view contacts" ON public.contacts
    FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role can insert contacts" ON public.contacts
    FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update contacts" ON public.contacts
    FOR UPDATE TO service_role USING (true);

CREATE POLICY "Service role can view guest identifiers" ON public.guest_identifiers
    FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role can insert guest identifiers" ON public.guest_identifiers
    FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update guest identifiers" ON public.guest_identifiers
    FOR UPDATE TO service_role USING (true);
