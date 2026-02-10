import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const since = new Date();
    since.setDate(since.getDate() - 30);

    // Fetch all transactions
    const { data: transactions, error } = await supabase
      .from("wallet_transactions")
      .select("*, tenants(name, business_type)")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Process data
    const dayBuckets = new Map<string, { tokens: number; cost: number; count: number }>();
    let tokensToday = 0;
    let costToday = 0;
    let messagesToday = 0;
    const todayKey = new Date().toISOString().slice(0, 10);

    const processedTransactions = transactions.map((tx: any) => ({
      id: tx.id,
      tenant_id: tx.tenant_id,
      tenant_name: tx.tenants?.name || "Unknown",
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      timestamp: tx.created_at,
      metadata: tx.metadata
    }));

    transactions.forEach((tx: any) => {
      const date = tx.created_at.slice(0, 10);
      if (!dayBuckets.has(date)) {
        dayBuckets.set(date, { tokens: 0, cost: 0, count: 0 });
      }
      
      const bucket = dayBuckets.get(date)!;
      
      if (tx.type === 'ai_usage') {
        const tokens = tx.metadata?.tokens || 0;
        bucket.tokens += tokens;
        bucket.cost += Math.abs(tx.amount);
        bucket.count += 1;

        if (date === todayKey) {
          tokensToday += tokens;
          costToday += Math.abs(tx.amount);
          messagesToday += 1;
        }
      }
    });

    const byDay = Array.from(dayBuckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({ 
        date, 
        tokens: data.tokens, 
        messages: data.count,
        cost: data.cost 
      }));

    return NextResponse.json({
      summary: {
        tokensToday,
        messagesToday,
        costToday
      },
      byDay,
      walletTransactions: processedTransactions
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
