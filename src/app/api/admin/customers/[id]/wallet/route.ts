import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { getTenantIdForUser } from "@/app/actions/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { amount, reason } = body || {};
    if (typeof amount !== "number" || !amount) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !adminUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: customerId } = await params;
    const { data: account, error: accountError } = await supabase
      .from("kaisa_accounts")
      .select("wallet_balance")
      .eq("user_id", customerId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: accountError?.message || "Account not found" }, { status: 404 });
    }

    const currentBalance = Number(account.wallet_balance || 0);
    const nextBalance = currentBalance + amount;
    const type = amount >= 0 ? "credit" : "debit";

    const { error: updateError } = await supabase
      .from("kaisa_accounts")
      .update({ wallet_balance: nextBalance })
      .eq("user_id", customerId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      host_id: customerId,
      type,
      amount: Math.abs(amount),
      reason: reason || "Admin adjustment",
      status: "completed",
      timestamp: new Date().toISOString()
    });

    if (transactionError) {
      return NextResponse.json({ error: transactionError.message }, { status: 500 });
    }

    // Log Admin Wallet Adjustment
    // Attempt to resolve a tenant for the customer, though this is a user-level action
    const tenantId = await getTenantIdForUser(customerId);

    await logEvent({
      tenant_id: tenantId, // Might be null if user has no tenant yet, but usually they do
      actor_type: 'admin',
      actor_id: adminUser.id,
      event_type: EVENT_TYPES.ADMIN_WALLET_ADJUSTED,
      entity_type: 'wallet',
      entity_id: customerId, // Wallet is 1:1 with user
      metadata: { 
        amount, 
        reason, 
        old_balance: currentBalance,
        new_balance: nextBalance
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Request failed" }, { status: 500 });
  }
}
