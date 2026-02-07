import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("ai_managers")
      .select("slug, name, status, base_monthly_price, updated_at")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const managers = (data || []).map((row: any) => ({
      slug: row.slug,
      name: row.name,
      status: row.status,
      baseMonthlyPrice: Number(row.base_monthly_price || 0),
      updatedAt: row.updated_at || null
    }));

    return NextResponse.json({ managers });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch AI managers" }, { status: 500 });
  }
}
