import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, listing_id, guest_id, start_date, end_date, status, source, amount, guest_contact, payment_id, created_at, guests(name, phone, email), listings!inner(host_id)")
      .eq("id", id)
      .eq("listings.host_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const { data: payment } = await supabase
      .from("payments")
      .select("id, booking_id, provider, amount, status, payment_link, paid_at")
      .eq("booking_id", booking.id)
      .maybeSingle();

    return NextResponse.json({
      booking: {
        id: booking.id,
        listing_id: booking.listing_id,
        guest_name: booking.guests?.name || "Guest",
        guest_contact: booking.guest_contact || booking.guests?.phone || booking.guests?.email || null,
        check_in: booking.start_date,
        check_out: booking.end_date,
        amount: Number(booking.amount || 0),
        status: booking.status,
        payment_id: booking.payment_id || null,
        created_at: booking.created_at,
        source: booking.source || "direct"
      },
      payment: payment
        ? {
            id: payment.id,
            booking_id: payment.booking_id,
            provider: payment.provider,
            amount: Number(payment.amount || 0),
            status: payment.status,
            payment_link: payment.payment_link,
            paid_at: payment.paid_at
          }
        : null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load booking" }, { status: 500 });
  }
}
