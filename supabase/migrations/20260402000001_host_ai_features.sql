-- ==========================================
-- HOST AI FEATURES - Database Schema
-- ==========================================

-- 1. REVIEWS - For Airbnb/OTA review management
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    external_id TEXT,
    platform TEXT NOT NULL CHECK (platform IN ('airbnb', 'booking', 'mmt', 'google', 'direct')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    response_text TEXT,
    responded_at TIMESTAMPTZ,
    is_public BOOLEAN DEFAULT true,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_tenant_id ON public.reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON public.reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_platform ON public.reviews(platform);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_can_view_reviews" ON public.reviews;
CREATE POLICY "tenant_can_view_reviews" ON public.reviews
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

-- 2. BLOCKED DATES - For manual calendar blocking
CREATE TABLE IF NOT EXISTS public.blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_listing_id ON public.blocked_dates(listing_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_dates ON public.blocked_dates(start_date, end_date);

ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_can_view_blocked_dates" ON public.blocked_dates;
CREATE POLICY "tenant_can_view_blocked_dates" ON public.blocked_dates
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

-- 3. TASKS - For cleaning and task management
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('cleaning', 'maintenance', 'inspection', 'checkin', 'checkout', 'general')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to TEXT,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_tenant_id ON public.tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_listing_id ON public.tasks(listing_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_can_view_tasks" ON public.tasks;
CREATE POLICY "tenant_can_view_tasks" ON public.tasks
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

-- 4. GUEST LOYALTY - Guest loyalty program
CREATE TABLE IF NOT EXISTS public.guest_loyalty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    total_bookings INTEGER DEFAULT 0,
    total_spent NUMERIC(12,2) DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    points INTEGER DEFAULT 0,
    last_booking_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, guest_id)
);

CREATE INDEX IF NOT EXISTS idx_guest_loyalty_tenant_guest ON public.guest_loyalty(tenant_id, guest_id);

ALTER TABLE public.guest_loyalty ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_can_view_guest_loyalty" ON public.guest_loyalty;
CREATE POLICY "tenant_can_view_guest_loyalty" ON public.guest_loyalty
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

-- 5. CHANNEL CREDENTIALS - For Booking.com, MMT, etc
CREATE TABLE IF NOT EXISTS public.channel_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('airbnb', 'booking', 'mmt', 'google', 'Vrbo', 'expedia')),
    credentials JSONB,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'success', 'error')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_channel_credentials_listing ON public.channel_credentials(listing_id);
CREATE INDEX IF NOT EXISTS idx_channel_credentials_channel ON public.channel_credentials(channel);

ALTER TABLE public.channel_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_can_view_channel_credentials" ON public.channel_credentials;
CREATE POLICY "tenant_can_view_channel_credentials" ON public.channel_credentials
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

-- 6. TEAM PERMISSIONS - Enhanced role-based access
CREATE TABLE IF NOT EXISTS public.team_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'viewer')),
    permissions JSONB DEFAULT '{}',
    can_manage_listings BOOLEAN DEFAULT false,
    can_manage_bookings BOOLEAN DEFAULT false,
    can_manage_payments BOOLEAN DEFAULT false,
    can_manage_guests BOOLEAN DEFAULT false,
    can_manage_integrations BOOLEAN DEFAULT false,
    can_manage_team BOOLEAN DEFAULT false,
    can_view_financials BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_permissions_tenant ON public.team_permissions(tenant_id);

ALTER TABLE public.team_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_can_view_team_permissions" ON public.team_permissions;
CREATE POLICY "tenant_can_view_team_permissions" ON public.team_permissions
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

-- 7. REVENUE REPORTS - For exports
CREATE TABLE IF NOT EXISTS public.revenue_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'occupancy', 'revenue', 'guest')),
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    data JSONB,
    file_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_reports_tenant ON public.revenue_reports(tenant_id);

ALTER TABLE public.revenue_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_can_view_revenue_reports" ON public.revenue_reports;
CREATE POLICY "tenant_can_view_revenue_reports" ON public.revenue_reports
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

-- 8. LISTING AMENITIES - Property amenities
CREATE TABLE IF NOT EXISTS public.listing_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    amenity_category TEXT,
    amenity_name TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_amenities_listing ON public.listing_amenities(listing_id);

ALTER TABLE public.listing_amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_can_view_listing_amenities" ON public.listing_amenities;
CREATE POLICY "tenant_can_view_listing_amenities" ON public.listing_amenities
  FOR SELECT USING (
    listing_id IN (SELECT id FROM listings WHERE tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()))
  );

-- 9. CALENDAR SYNC LOGS - Track calendar sync history
CREATE TABLE IF NOT EXISTS public.calendar_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('push', 'pull', 'bidirectional')),
    source TEXT NOT NULL,
    events_added INTEGER DEFAULT 0,
    events_updated INTEGER DEFAULT 0,
    events_removed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'partial')),
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_calendar_sync_logs_listing ON public.calendar_sync_logs(listing_id);

-- 10. AUTOMATED MESSAGES - For review request automation
CREATE TABLE IF NOT EXISTS public.automated_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('booking_confirmed', 'checkin', 'checkout', 'post_stay', 'review_received')),
    subject TEXT,
    body TEXT NOT NULL,
    channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'sms', 'email', 'airbnb')),
    is_active BOOLEAN DEFAULT true,
    delay_hours INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.automated_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_can_view_automated_messages" ON public.automated_messages;
CREATE POLICY "tenant_can_view_automated_messages" ON public.automated_messages
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for new tables
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guest_loyalty_updated_at ON public.guest_loyalty;
CREATE TRIGGER update_guest_loyalty_updated_at
    BEFORE UPDATE ON public.guest_loyalty
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_channel_credentials_updated_at ON public.channel_credentials;
CREATE TRIGGER update_channel_credentials_updated_at
    BEFORE UPDATE ON public.channel_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_permissions_updated_at ON public.team_permissions;
CREATE TRIGGER update_team_permissions_updated_at
    BEFORE UPDATE ON public.team_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_automated_messages_updated_at ON public.automated_messages;
CREATE TRIGGER update_automated_messages_updated_at
    BEFORE UPDATE ON public.automated_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
