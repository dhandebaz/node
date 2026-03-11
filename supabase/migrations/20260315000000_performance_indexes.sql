-- Performance Indexes Migration

-- 1. Tenants
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON public.tenants (created_at);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON public.tenants (subscription_status);

-- 2. Users & Accounts
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users (email); -- Usually exists, but ensuring for lookups
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_id ON public.accounts (tenant_id);

-- 3. Operational Tables (High Volume)
CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_id_created_at ON public.audit_events (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_events_tenant_id_created_at ON public.ai_usage_events (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id_start_date ON public.bookings (tenant_id, start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);

-- 4. Messaging
CREATE INDEX IF NOT EXISTS idx_messages_tenant_guest ON public.messages (tenant_id, guest_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages (listing_id, guest_id);

-- 5. Billing
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id_date ON public.invoices (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_tenant_id ON public.wallet_transactions (tenant_id, created_at DESC);
