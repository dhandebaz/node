import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { amount, reason } = body || {};
    if (typeof amount !== "number" || !amount) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { data: account, error: accountError } = await supabase
      .from("kaisa_accounts")
      .select("wallet_balance")
      .eq("user_id", params.id)
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
      .eq("user_id", params.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      host_id: params.id,
      type,
      amount: Math.abs(amount),
      reason: reason || "Admin adjustment",
      status: "completed",
      timestamp: new Date().toISOString()
    });

    if (transactionError) {
      return NextResponse.json({ error: transactionError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Request failed" }, { status: 500 });
  }
}
