import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const supabase = await getSupabaseServer();
    const { id } = await params;
    const customerId = id;

    // 1. Fetch User & Profile
    const [
      { data: user, error: userError },
      { data: profile, error: profileError },
      { data: account, error: accountError } // Keep for legacy/metadata
    ] = await Promise.all([
      supabase.from("users").select("id, phone, created_at").eq("id", customerId).single(),
      supabase.from("profiles").select("user_id, business_name").eq("user_id", customerId).single(),
      supabase.from("kaisa_accounts").select("user_id, tenant_id, status, plan_price, ai_manager_slug, created_at").eq("user_id", customerId).single(),
    ]);

    if (userError) {
       console.error("User fetch error", userError);
       return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Determine Tenant ID
    // Try account first, then tenant_users
    let tenantId = account?.tenant_id;
    if (!tenantId) {
        const { data: tenantUser } = await supabase.from("tenant_users").select("tenant_id").eq("user_id", customerId).limit(1).single();
        tenantId = tenantUser?.tenant_id;
    }

    // 3. Fetch Tenant-Scoped Data
    let walletBalance = 0;
    let transactions: any[] = [];
    let tenantControls = null;
    let integrations: any[] = [];
    let usageEvents: any[] = [];

    if (tenantId) {
        const [
            { data: wallet },
            { data: txs },
            { data: tenant },
            { data: ints },
            { data: events }
        ] = await Promise.all([
            supabase.from("wallets").select("balance").eq("tenant_id", tenantId).single(),
            supabase.from("wallet_transactions").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(50),
            supabase.from("tenants").select("is_ai_enabled, is_messaging_enabled, is_bookings_enabled, is_wallet_enabled, early_access").eq("id", tenantId).single(),
            supabase.from("listing_integrations").select("*").eq("tenant_id", tenantId),
            supabase.from("ai_usage_events").select("id, manager_slug, tokens_used, message_count, created_at").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(200)
        ]);

        walletBalance = Number(wallet?.balance || 0);
        transactions = (txs || []).map(tx => ({
            id: tx.id,
            type: tx.type,
            amount: Number(tx.amount),
            reason: tx.description || tx.type, // Map description to reason
            status: 'completed', // Transactions are atomic/completed
            timestamp: tx.created_at
        }));
        tenantControls = tenant;
        integrations = ints || [];
        usageEvents = events || [];
    } 
    
    // Fallback/Legacy data fetching if tenant-scoped data is missing
    if (transactions.length === 0 && !tenantId) {
         // Try legacy table if it exists? No, stick to new schema.
    }

    if (integrations.length === 0) {
         const { data: ints } = await supabase.from("integrations").select("id, provider, status, last_sync, expires_at, error_code").eq("user_id", customerId);
         if (ints && ints.length > 0) integrations = ints;
    }

    if (usageEvents.length === 0) {
        const { data: events } = await supabase.from("ai_usage_events").select("id, manager_slug, tokens_used, message_count, created_at").eq("user_id", customerId).order("created_at", { ascending: false }).limit(200);
        if (events && events.length > 0) usageEvents = events;
    }

    const usageSummary = usageEvents.reduce(
      (acc: { tokens: number; messages: number }, event: any) => ({
        tokens: acc.tokens + Number(event.tokens_used || 0),
        messages: acc.messages + Number(event.message_count || 0)
      }),
      { tokens: 0, messages: 0 }
    );

    // Fetch system logs
    const { data: logs } = await supabase.from("system_logs").select("id, severity, service, message, timestamp").eq("user_id", customerId).order("timestamp", { ascending: false }).limit(50);

    return NextResponse.json({
      profile: {
        id: user?.id,
        businessName: profile?.business_name || "Unassigned",
        phone: user?.phone || "",
        createdAt: account?.created_at || user?.created_at || null,
        status: account?.status || "active"
      },
      aiManager: {
        slug: account?.ai_manager_slug || null,
        planPrice: Number(account?.plan_price || 0),
        status: account?.status || "active"
      },
      wallet: {
        balance: walletBalance,
        transactions: transactions
      },
      usage: {
        tokensUsed: usageSummary.tokens,
        messages: usageSummary.messages,
        events: usageEvents
      },
      integrations: integrations,
      activityLogs: logs || [],
      controls: tenantControls || {
        is_ai_enabled: true,
        is_messaging_enabled: true,
        is_bookings_enabled: true,
        is_wallet_enabled: true,
        early_access: false
      },
      tenantId: tenantId
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load customer" }, { status: 500 });
  }
}
