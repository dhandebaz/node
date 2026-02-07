import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokenCostPer1k, nodeInfraMarginPct, coreLogicMarginPct } = body || {};

    if (
      typeof tokenCostPer1k !== "number" ||
      typeof nodeInfraMarginPct !== "number" ||
      typeof coreLogicMarginPct !== "number"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { data: existing } = await supabase.from("pricing_cost_config").select("id").limit(1);
    const rowId = existing?.[0]?.id;

    if (rowId) {
      const { error } = await supabase
        .from("pricing_cost_config")
        .update({
          token_cost_per_1k: tokenCostPer1k,
          node_infra_margin_pct: nodeInfraMarginPct,
          core_logic_margin_pct: coreLogicMarginPct,
          updated_at: new Date().toISOString()
        })
        .eq("id", rowId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase.from("pricing_cost_config").insert({
        token_cost_per_1k: tokenCostPer1k,
        node_infra_margin_pct: nodeInfraMarginPct,
        core_logic_margin_pct: coreLogicMarginPct,
        updated_at: new Date().toISOString()
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Request failed" }, { status: 500 });
  }
}
