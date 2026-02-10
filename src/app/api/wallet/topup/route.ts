import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

export async function POST(request: Request) {
  try {
    const tenantId = await requireActiveTenant();
    const body = await request.json();
    const amount = Number(body?.amount || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid top up amount" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: account, error: accountError } = await supabase
      .from("kaisa_accounts")
      .select("wallet_balance")
      .eq("user_id", user.id)
      .eq("tenant_id", tenantId)
      .single();

    if (accountError || !account) {
      // If account doesn't exist for this tenant, maybe create it? 
      // For now, assuming it exists or returning error.
      // But usually user should have an account. 
      // Let's stick to existing logic but scoped.
      return NextResponse.json({ error: accountError?.message || "Wallet not found" }, { status: 404 });
    }

    const currentBalance = Number(account.wallet_balance || 0);
    const nextBalance = currentBalance + amount;

    const { error: updateError } = await supabase
      .from("kaisa_accounts")
      .update({ wallet_balance: nextBalance })
      .eq("user_id", user.id)
      .eq("tenant_id", tenantId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: txError } = await supabase
      .from("wallet_transactions")
      .insert({
        tenant_id: tenantId,
        host_id: user.id,
        type: "credit",
        amount,
        reason: "Wallet top-up",
        status: "completed",
        timestamp: new Date().toISOString()
      });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    await logEvent({
      tenant_id: tenantId,
      actor_type: 'user',
      actor_id: user.id,
      event_type: EVENT_TYPES.WALLET_CREDITED,
      entity_type: 'wallet',
      entity_id: user.id, // Using user_id as wallet identifier for now
      metadata: { 
        amount, 
        old_balance: currentBalance,
        new_balance: nextBalance,
        reason: "Wallet top-up"
      }
    });

    return NextResponse.json({ balance: nextBalance });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Top up failed" }, { status: 500 });
  }
}
