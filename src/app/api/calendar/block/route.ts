import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const listingId = body?.listingId;
    const start = body?.dates?.start;
    const end = body?.dates?.end;

    if (!listingId || !start || !end) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, host_id")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    if (!listing || listing.host_id !== user.id) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        listing_id: listingId,
        guest_id: null,
        start_date: start,
        end_date: end,
        status: "blocked",
        source: "nodebase",
        amount: 0,
        created_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: bookingError?.message || "Failed to block dates" }, { status: 500 });
    }

    return NextResponse.json({
      id: booking.id,
      listingId,
      guestId: null,
      startDate: start,
      endDate: end,
      status: "blocked",
      source: "nodebase"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to block dates" }, { status: 500 });
  }
}
