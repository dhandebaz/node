import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, guest_id, listings!inner(host_id)")
      .eq("id", bookingId)
      .eq("listings.host_id", user.id)
      .maybeSingle();

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const { data: guestId, error } = await supabase
      .from("guest_ids")
      .select("id, booking_id, guest_name, id_type, status, uploaded_at, reviewed_at, front_image_path, back_image_path, rejection_reason")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(guestId || null);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load guest ID" }, { status: 500 });
  }
}
