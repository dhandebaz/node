-- Migration: Notifications System
-- Creates notifications table for real-time customer alerts

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Notification type
    type TEXT NOT NULL, -- new_customer, cross_channel_link, booking_confirmed, payment_received, kyc_submitted, ai_low_credits, message_received
    
    -- Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Related data
    data JSONB DEFAULT '{}',
    channel TEXT,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    
    -- Read status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for efficient queries
CREATE INDEX IF NOT EXISTS notifications_tenant_idx ON public.notifications(tenant_id);
CREATE INDEX IF NOT EXISTS notifications_tenant_unread_idx ON public.notifications(tenant_id) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS notifications_type_idx ON public.notifications(type);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_contact_idx ON public.notifications(contact_id);

-- 3. RLS policies
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

-- 4. Service role policies for webhook/API insertions
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications" ON public.notifications
    FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can view notifications" ON public.notifications;
CREATE POLICY "Service role can view notifications" ON public.notifications
    FOR SELECT TO service_role USING (true);
