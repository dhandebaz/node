import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id: tenantId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const severity = searchParams.get("severity") || "all";
    const service = searchParams.get("service") || "all";

    const supabase = await getSupabaseAdmin();

    let query = supabase
      .from("system_logs")
      .select("id, severity, service, message, metadata, timestamp, user_id", { count: "exact" })
      .eq("tenant_id", tenantId);

    if (severity !== "all") {
      query = query.eq("severity", severity);
    }
    if (service !== "all") {
      query = query.eq("service", service);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .range(from, to)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Failed to fetch tenant activity:", error);
      return NextResponse.json(
        { error: "Failed to fetch activity" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      activities: data || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching tenant activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
