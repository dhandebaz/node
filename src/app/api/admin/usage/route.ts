import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [{ data: usageEvents, error: usageError }, { data: walletTransactions, error: walletError }] = await Promise.all([
      supabase
        .from("ai_usage_events")
        .select("id, manager_slug, user_id, tokens_used, message_count, created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false }),
      supabase
        .from("wallet_transactions")
        .select("id, host_id, type, amount, reason, status, timestamp")
        .gte("timestamp", since.toISOString())
        .order("timestamp", { ascending: false })
    ]);

    if (usageError || walletError) {
      return NextResponse.json({ error: usageError?.message || walletError?.message }, { status: 500 });
    }

    const dayBuckets = new Map<string, { tokens: number; messages: number }>();
    const managerBuckets = new Map<string, { tokens: number; messages: number }>();
    const todayKey = formatDateKey(new Date());

    let tokensToday = 0;
    let messagesToday = 0;

    (usageEvents || []).forEach((event: any) => {
      const eventDate = new Date(event.created_at);
      const key = formatDateKey(eventDate);
      const tokens = Number(event.tokens_used || 0);
      const messages = Number(event.message_count || 0);

      if (!dayBuckets.has(key)) {
        dayBuckets.set(key, { tokens: 0, messages: 0 });
      }
      const dayBucket = dayBuckets.get(key)!;
      dayBucket.tokens += tokens;
      dayBucket.messages += messages;

      const managerKey = event.manager_slug || "unassigned";
      if (!managerBuckets.has(managerKey)) {
        managerBuckets.set(managerKey, { tokens: 0, messages: 0 });
      }
      const managerBucket = managerBuckets.get(managerKey)!;
      managerBucket.tokens += tokens;
      managerBucket.messages += messages;

      if (key === todayKey) {
        tokensToday += tokens;
        messagesToday += messages;
      }
    });

    const byDay = Array.from(dayBuckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({ date, tokens: data.tokens, messages: data.messages }));

    const byManager = Array.from(managerBuckets.entries()).map(([managerSlug, data]) => ({
      managerSlug,
      tokens: data.tokens,
      messages: data.messages
    }));

    const topUps = (walletTransactions || []).filter((tx: any) => tx.type === "credit");

    return NextResponse.json({
      summary: {
        tokensToday,
        messagesToday
      },
      byDay,
      byManager,
      walletTransactions: walletTransactions || [],
      topUps
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load usage" }, { status: 500 });
  }
}
