import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

type Payload = {
  listingId: string;
  guestName: string;
  guestPhone?: string | null;
  guestEmail?: string | null;
  amount: number;
  checkIn: string;
  checkOut: string;
  notes?: string | null;
};

const normalizeContact = (phone?: string | null, email?: string | null) => {
  if (phone && phone.trim()) return phone.trim();
  if (email && email.trim()) return email.trim();
  return null;
};

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Payload;
    const listingId = body?.listingId;
    const guestName = body?.guestName?.trim();
    const guestPhone = body?.guestPhone?.trim() || null;
    const guestEmail = body?.guestEmail?.trim() || null;
    const amount = Number(body?.amount || 0);
    const checkIn = body?.checkIn;
    const checkOut = body?.checkOut;

    if (!listingId || !guestName || !amount || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, host_id, name, title")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    if (!listing || listing.host_id !== user.id) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const { data: payoutAccount } = await supabase
      .from("payment_accounts")
      .select("status")
      .eq("user_id", user.id)
      .eq("provider", "razorpay")
      .maybeSingle();

    if (!payoutAccount || payoutAccount.status !== "active") {
      return NextResponse.json({ error: "Payout setup incomplete" }, { status: 400 });
    }

    let guestId: string | null = null;
    if (guestEmail) {
      const { data: existing } = await supabase
        .from("guests")
        .select("id")
        .eq("email", guestEmail)
        .maybeSingle();
      guestId = existing?.id || null;
    }
    if (!guestId && guestPhone) {
      const { data: existing } = await supabase
        .from("guests")
        .select("id")
        .eq("phone", guestPhone)
        .maybeSingle();
      guestId = existing?.id || null;
    }

    if (!guestId) {
      const { data: inserted, error: guestError } = await supabase
        .from("guests")
        .insert({
          name: guestName,
          phone: guestPhone,
          email: guestEmail,
          channel: "direct",
          id_verification_status: "none",
          created_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (guestError || !inserted) {
        return NextResponse.json({ error: guestError?.message || "Failed to create guest" }, { status: 500 });
      }
      guestId = inserted.id;
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        listing_id: listingId,
        guest_id: guestId,
        start_date: checkIn,
        end_date: checkOut,
        guest_contact: normalizeContact(guestPhone, guestEmail),
        amount,
        status: "payment_pending",
        source: "direct",
        created_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: bookingError?.message || "Failed to create booking" }, { status: 500 });
    }

    const paymentLink = `https://rzp.io/l/${randomUUID().slice(0, 8)}`;
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id: booking.id,
        provider: "razorpay",
        amount,
        status: "pending",
        payment_link: paymentLink,
        paid_at: null,
        created_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: paymentError?.message || "Failed to create payment" }, { status: 500 });
    }

    await supabase
      .from("bookings")
      .update({ payment_id: payment.id })
      .eq("id", booking.id);

    return NextResponse.json({
      bookingId: booking.id,
      paymentId: payment.id,
      paymentLink
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create payment link" }, { status: 500 });
  }
}
