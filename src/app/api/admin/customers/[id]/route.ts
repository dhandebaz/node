import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseServer();
    const customerId = params.id;

    const [
      { data: user, error: userError },
      { data: profile, error: profileError },
      { data: account, error: accountError },
      { data: transactions, error: transactionsError },
      { data: integrations, error: integrationsError },
      { data: usageEvents, error: usageError },
      { data: logs, error: logsError }
    ] = await Promise.all([
      supabase.from("users").select("id, phone, created_at").eq("id", customerId).single(),
      supabase.from("profiles").select("user_id, business_name").eq("user_id", customerId).single(),
      supabase.from("kaisa_accounts").select("user_id, status, wallet_balance, plan_price, ai_manager_slug, created_at").eq("user_id", customerId).single(),
      supabase.from("wallet_transactions").select("id, type, amount, reason, status, timestamp").eq("host_id", customerId).order("timestamp", { ascending: false }).limit(50),
      supabase.from("integrations").select("id, provider, status, last_sync, expires_at, error_code").eq("user_id", customerId),
      supabase.from("ai_usage_events").select("id, manager_slug, tokens_used, message_count, created_at").eq("user_id", customerId).order("created_at", { ascending: false }).limit(200),
      supabase.from("system_logs").select("id, severity, service, message, timestamp").eq("user_id", customerId).order("timestamp", { ascending: false }).limit(50)
    ]);

    if (userError || profileError || accountError || transactionsError || integrationsError || usageError || logsError) {
      return NextResponse.json({ error: userError?.message || profileError?.message || accountError?.message || transactionsError?.message || integrationsError?.message || usageError?.message || logsError?.message }, { status: 500 });
    }

    const usageSummary = (usageEvents || []).reduce(
      (acc: { tokens: number; messages: number }, event: any) => ({
        tokens: acc.tokens + Number(event.tokens_used || 0),
        messages: acc.messages + Number(event.message_count || 0)
      }),
      { tokens: 0, messages: 0 }
    );

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
        balance: Number(account?.wallet_balance || 0),
        transactions: transactions || []
      },
      usage: {
        tokensUsed: usageSummary.tokens,
        messages: usageSummary.messages,
        events: usageEvents || []
      },
      integrations: integrations || [],
      activityLogs: logs || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load customer" }, { status: 500 });
  }
}
