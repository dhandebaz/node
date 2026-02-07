import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const computeNextBillingDate = (cycleStart: Date) => {
  const nextDate = new Date(cycleStart);
  const now = new Date();
  if (Number.isNaN(nextDate.getTime())) return null;
  nextDate.setMonth(nextDate.getMonth() + 1);
  while (nextDate <= now) {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  return nextDate.toISOString();
};

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: account, error: accountError } = await supabase
      .from("kaisa_accounts")
      .select("status, created_at, ai_manager_slug, plan_price")
      .eq("user_id", user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: accountError?.message || "Account not found" }, { status: 404 });
    }

    let manager: { name: string | null; slug: string | null; base_monthly_price: number | null } | null = null;
    if (account.ai_manager_slug) {
      const { data: managerRow, error: managerError } = await supabase
        .from("ai_managers")
        .select("slug, name, base_monthly_price")
        .eq("slug", account.ai_manager_slug)
        .single();

      if (!managerError && managerRow) {
        manager = managerRow;
      }
    }

    let lastInvoiceDate: string | null = null;
    const { data: invoiceRows, error: invoiceError } = await supabase
      .from("invoices")
      .select("date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1);

    if (!invoiceError && invoiceRows && invoiceRows.length > 0) {
      lastInvoiceDate = invoiceRows[0].date || null;
    }

    const cycleStart = lastInvoiceDate
      ? new Date(lastInvoiceDate)
      : account.created_at
        ? new Date(account.created_at)
        : null;

    const nextBillingDate = cycleStart ? computeNextBillingDate(cycleStart) : null;

    return NextResponse.json({
      aiManager: {
        name: manager?.name || null,
        slug: manager?.slug || account.ai_manager_slug || null
      },
      baseMonthlyPrice: Number(manager?.base_monthly_price ?? account.plan_price ?? 0),
      currency: "INR",
      status: account.status || "active",
      nextBillingDate
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load billing summary" }, { status: 500 });
  }
}
