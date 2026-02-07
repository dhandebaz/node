import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: account, error } = await supabase
    .from("kaisa_accounts")
    .select("wallet_balance, status")
    .eq("user_id", user.id)
    .single();

  if (error || !account) {
    return NextResponse.json({ error: error?.message || "Wallet not found" }, { status: 404 });
  }

  return NextResponse.json({
    balance: Number(account.wallet_balance || 0),
    status: account.status || "active"
  });
}
