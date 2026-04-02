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
    const platform = searchParams.get("platform");

    if (!tenant_id) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    let query = supabase
      .from("reviews")
      .select("*")
      .eq("tenant_id", tenant_id)
      .order("received_at", { ascending: false });

    if (listing_id) {
      query = query.eq("listing_id", listing_id);
    }
    if (platform && platform !== "all") {
      query = query.eq("platform", platform);
    }

    const { data: reviews, error } = await query;

    if (error) throw error;

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_id, listing_id, booking_id, guest_id, external_id, platform, rating, title, content } = body;

    if (!tenant_id || !listing_id || !platform || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        tenant_id,
        listing_id,
        booking_id,
        guest_id,
        external_id,
        platform,
        rating,
        title,
        content,
        received_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}