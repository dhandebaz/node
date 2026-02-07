import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { managerSlug, avgMessagesPerDay, avgTokensPerMessage, calendarSyncMonthlyCost, integrationApiMonthlyCost } = body || {};

    if (
      !managerSlug ||
      typeof avgMessagesPerDay !== "number" ||
      typeof avgTokensPerMessage !== "number" ||
      typeof calendarSyncMonthlyCost !== "number" ||
      typeof integrationApiMonthlyCost !== "number"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { error } = await supabase.from("ai_manager_cost_inputs").upsert(
      {
        manager_slug: managerSlug,
        avg_messages_per_day: avgMessagesPerDay,
        avg_tokens_per_message: avgTokensPerMessage,
        calendar_sync_monthly_cost: calendarSyncMonthlyCost,
        integration_api_monthly_cost: integrationApiMonthlyCost,
        updated_at: new Date().toISOString()
      },
      { onConflict: "manager_slug" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Request failed" }, { status: 500 });
  }
}
