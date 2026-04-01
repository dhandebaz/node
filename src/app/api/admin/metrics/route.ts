import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const supabase = await getSupabaseAdmin();

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [lastHourLogs, lastDayLogs, errorLogs, totalRequests] = await Promise.all([
      supabase
        .from("system_logs")
        .select("id")
        .gte("timestamp", oneHourAgo.toISOString()),
      supabase
        .from("system_logs")
        .select("id")
        .gte("timestamp", oneDayAgo.toISOString()),
      supabase
        .from("system_logs")
        .select("id")
        .eq("severity", "error")
        .gte("timestamp", oneDayAgo.toISOString()),
      supabase
        .from("system_logs")
        .select("id", { count: "exact" }),
    ]);

    const serviceCounts = await supabase
      .from("system_logs")
      .select("service")
      .gte("timestamp", oneDayAgo.toISOString());

    const serviceBreakdown: Record<string, number> = {};
    serviceCounts.data?.forEach((log: any) => {
      const svc = log.service || "unknown";
      serviceBreakdown[svc] = (serviceBreakdown[svc] || 0) + 1;
    });

    return NextResponse.json({
      metrics: {
        requests_last_hour: lastHourLogs.data?.length || 0,
        requests_last_day: lastDayLogs.data?.length || 0,
        errors_last_day: errorLogs.data?.length || 0,
        total_requests: totalRequests.count || 0,
        error_rate: lastDayLogs.data?.length 
          ? ((errorLogs.data?.length || 0) / lastDayLogs.data?.length * 100).toFixed(2)
          : "0",
      },
      service_breakdown: serviceBreakdown,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching API metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
