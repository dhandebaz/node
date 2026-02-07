import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const service = searchParams.get("service");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const supabase = await getSupabaseServer();
    let query = supabase.from("system_logs").select("id, severity, service, message, metadata, timestamp").order("timestamp", { ascending: false });

    if (severity && severity !== "all") {
      query = query.eq("severity", severity);
    }
    if (service && service !== "all") {
      query = query.eq("service", service);
    }
    if (from) {
      query = query.gte("timestamp", from);
    }
    if (to) {
      query = query.lte("timestamp", to);
    }

    const { data, error } = await query.limit(200);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load logs" }, { status: 500 });
  }
}
