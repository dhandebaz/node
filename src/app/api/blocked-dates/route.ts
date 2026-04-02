import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get("tenant_id");
    const listing_id = searchParams.get("listing_id");

    if (!tenant_id) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    let query = supabase
      .from("blocked_dates")
      .select("*")
      .eq("tenant_id", tenant_id)
      .order("start_date", { ascending: true });

    if (listing_id) {
      query = query.eq("listing_id", listing_id);
    }

    const { data: blocked_dates, error } = await query;

    if (error) throw error;

    return NextResponse.json({ blocked_dates });
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    return NextResponse.json({ error: "Failed to fetch blocked dates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_id, listing_id, start_date, end_date, reason } = body;

    if (!tenant_id || !listing_id || !start_date || !end_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: blocked_date, error } = await supabase
      .from("blocked_dates")
      .insert({
        tenant_id,
        listing_id,
        start_date,
        end_date,
        reason,
        created_by: null
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ blocked_date });
  } catch (error) {
    console.error("Error creating blocked date:", error);
    return NextResponse.json({ error: "Failed to create blocked date" }, { status: 500 });
  }
}