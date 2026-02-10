import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const invoices = (data || []).map((inv: any) => ({
      id: inv.id,
      date: inv.date || inv.created_at,
      description: inv.description || inv.items?.[0]?.description || null,
      amount: Number(inv.amount || 0),
      currency: inv.currency || null,
      status: inv.status || null,
      pdfUrl: inv.pdf_url || inv.pdfUrl || null
    }));

    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load invoices" }, { status: 500 });
  }
}
