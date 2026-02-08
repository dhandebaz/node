import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { data: guestId, error } = await supabase
      .from("guest_ids")
      .select("id, booking_id, bookings(guest_id, listings!inner(host_id))")
      .eq("id", id)
      .eq("bookings.listings.host_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!guestId) {
      return NextResponse.json({ error: "Guest ID not found" }, { status: 404 });
    }

    await supabase
      .from("guest_ids")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        rejection_reason: null
      })
      .eq("id", id);

    await supabase
      .from("bookings")
      .update({ id_status: "approved" })
      .eq("id", guestId.booking_id);

    const booking = Array.isArray(guestId.bookings) ? guestId.bookings[0] : guestId.bookings;
    const guestIdValue = booking?.guest_id;
    if (guestIdValue) {
      await supabase
        .from("guests")
        .update({ id_verification_status: "verified" })
        .eq("id", guestIdValue);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to approve ID" }, { status: 500 });
  }
}
