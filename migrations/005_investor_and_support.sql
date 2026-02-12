-- Migration 005: Investor & Support System

-- 1. Support Tickets System
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    product TEXT, -- 'kaisa', 'space', 'node', etc.
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID, -- NULL for system/support agents if not mapped to users, or admin ID
    sender_role TEXT DEFAULT 'user', -- 'user', 'support', 'system'
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- 2. Investor System (Documents & Reports)
CREATE TABLE IF NOT EXISTS public.investor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT, -- 'agreement', 'kyc', 'tax', 'other'
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.investor_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    period TEXT, -- 'Q1 2024', 'Jan 2024'
    url TEXT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- 3. Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_reports ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Support Tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets" ON public.support_tickets
    FOR UPDATE USING (auth.uid() = user_id);

-- Support Messages
CREATE POLICY "Users can view messages for own tickets" ON public.support_ticket_messages
    FOR SELECT USING (
        exists (select 1 from public.support_tickets where id = support_ticket_messages.ticket_id and user_id = auth.uid())
    );

CREATE POLICY "Users can add messages to own tickets" ON public.support_ticket_messages
    FOR INSERT WITH CHECK (
        exists (select 1 from public.support_tickets where id = support_ticket_messages.ticket_id and user_id = auth.uid())
    );

-- Investor Documents
CREATE POLICY "Users can view own documents" ON public.investor_documents
    FOR SELECT USING (auth.uid() = user_id);

-- Investor Reports
CREATE POLICY "Users can view own reports" ON public.investor_reports
    FOR SELECT USING (auth.uid() = user_id);

-- Admin Policies (Assuming admin role check)
CREATE POLICY "Admins can view all tickets" ON public.support_tickets
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role = 'admin')
    );

CREATE POLICY "Admins can view all messages" ON public.support_ticket_messages
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role = 'admin')
    );

CREATE POLICY "Admins can manage investor documents" ON public.investor_documents
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role = 'admin')
    );

CREATE POLICY "Admins can manage investor reports" ON public.investor_reports
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role = 'admin')
    );
