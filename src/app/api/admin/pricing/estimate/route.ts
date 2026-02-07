import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

type CostConfigRow = {
  token_cost_per_1k: number | null;
  node_infra_margin_pct: number | null;
  core_logic_margin_pct: number | null;
};

type CostInputRow = {
  manager_slug: string;
  avg_messages_per_day: number | null;
  avg_tokens_per_message: number | null;
  calendar_sync_monthly_cost: number | null;
  integration_api_monthly_cost: number | null;
  updated_at?: string | null;
};

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const [{ data: managers, error: managersError }, { data: configRows, error: configError }, { data: inputs, error: inputsError }, { data: pricingHistory, error: historyError }] =
      await Promise.all([
        supabase.from("ai_managers").select("slug, name, status, base_monthly_price, updated_at").order("name", { ascending: true }),
        supabase.from("pricing_cost_config").select("token_cost_per_1k, node_infra_margin_pct, core_logic_margin_pct").limit(1),
        supabase.from("ai_manager_cost_inputs").select("manager_slug, avg_messages_per_day, avg_tokens_per_message, calendar_sync_monthly_cost, integration_api_monthly_cost, updated_at"),
        supabase.from("ai_manager_pricing_history").select("manager_slug, old_price, new_price, changed_by, timestamp").order("timestamp", { ascending: false }).limit(50)
      ]);

    if (managersError || configError || inputsError || historyError) {
      return NextResponse.json({ error: managersError?.message || configError?.message || inputsError?.message || historyError?.message }, { status: 500 });
    }

    const configRow = (configRows?.[0] || {}) as CostConfigRow;
    const tokenCostPer1k = Number(configRow.token_cost_per_1k || 0);
    const nodeInfraMarginPct = Number(configRow.node_infra_margin_pct || 0);
    const coreLogicMarginPct = Number(configRow.core_logic_margin_pct || 0);
    const inputsMap = new Map((inputs || []).map((row: CostInputRow) => [row.manager_slug, row]));

    const estimates = (managers || []).map((manager: any) => {
      const input = inputsMap.get(manager.slug);
      const avgMessagesPerDay = Number(input?.avg_messages_per_day || 0);
      const avgTokensPerMessage = Number(input?.avg_tokens_per_message || 0);
      const calendarSyncMonthlyCost = Number(input?.calendar_sync_monthly_cost || 0);
      const integrationApiMonthlyCost = Number(input?.integration_api_monthly_cost || 0);

      const monthlyMessages = avgMessagesPerDay * 30;
      const tokenCost = (monthlyMessages * avgTokensPerMessage / 1000) * tokenCostPer1k;
      const infraCost = calendarSyncMonthlyCost + integrationApiMonthlyCost;
      const totalCost = tokenCost + infraCost;
      const marginMultiplier = 1 + nodeInfraMarginPct / 100 + coreLogicMarginPct / 100;
      const suggestedMinimumPrice = Math.ceil(totalCost * marginMultiplier);

      return {
        slug: manager.slug,
        estimatedMonthlyTokenCost: Math.ceil(tokenCost),
        estimatedMonthlyInfraCost: Math.ceil(infraCost),
        estimatedMonthlyTotalCost: Math.ceil(totalCost),
        suggestedMinimumPrice,
        inputs: {
          avgMessagesPerDay,
          avgTokensPerMessage,
          calendarSyncMonthlyCost,
          integrationApiMonthlyCost,
          updatedAt: input?.updated_at || null
        }
      };
    });

    const managersPayload = (managers || []).map((row: any) => ({
      slug: row.slug,
      name: row.name,
      status: row.status,
      baseMonthlyPrice: Number(row.base_monthly_price || 0),
      updatedAt: row.updated_at || null
    }));

    return NextResponse.json({
      config: {
        tokenCostPer1k,
        nodeInfraMarginPct,
        coreLogicMarginPct
      },
      managers: managersPayload,
      estimates,
      pricingHistory: pricingHistory || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to calculate pricing" }, { status: 500 });
  }
}
