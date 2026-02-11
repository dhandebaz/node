import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { ControlService } from "@/lib/services/controlService";
import { RazorpayService } from "@/lib/services/razorpayService";
import { SubscriptionService } from "@/lib/services/subscriptionService";

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

    const tenantId = await requireActiveTenant();

    // Check kill switch
    try {
      await ControlService.checkAction(tenantId, 'payment');
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 503 });
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
      .select("id, tenant_id, name, title")
      .eq("id", listingId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    if (!listing) {
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

    // Fetch Tenant Business Type to determine validation rules
    const { data: tenant } = await supabase
      .from("tenants")
      .select("business_type")
      .eq("id", tenantId)
      .single();

    const businessType = tenant?.business_type || 'airbnb_host';

    // Subscription Limit Check
    const { allowed, limit, current } = await SubscriptionService.checkMonthlyLimit(tenantId, 'bookings');
    if (!allowed) {
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'user',
        event_type: EVENT_TYPES.ACTION_BLOCKED,
        entity_type: 'subscription',
        entity_id: 'monthly_limit',
        metadata: { limit, current, resource: 'bookings' }
      });
      return NextResponse.json({ 
        error: `Monthly booking limit reached (${limit}). Upgrade your plan to accept more bookings.` 
      }, { status: 403 });
    }

    // Overlap Check (Only for Airbnb and Doctor)
    // Kirana/Thrift allow concurrent orders (no date blocking)
    if (businessType === 'airbnb_host' || businessType === 'doctor_clinic') {
      const { data: conflict } = await supabase
        .from("bookings")
        .select("id")
        .eq("listing_id", listingId)
        .neq("status", "cancelled")
        .lt("start_date", checkOut)
        .gt("end_date", checkIn)
        .maybeSingle();

      if (conflict) {
        return NextResponse.json({ error: "Selected dates are already booked" }, { status: 409 });
      }
    }

    let guestId: string | null = null;
    // Check for existing guest in this tenant
    if (guestEmail) {
      const { data: existing } = await supabase
        .from("guests")
        .select("id")
        .eq("email", guestEmail)
        .eq("tenant_id", tenantId)
        .maybeSingle();
      guestId = existing?.id || null;
    }
    if (!guestId && guestPhone) {
      const { data: existing } = await supabase
        .from("guests")
        .select("id")
        .eq("phone", guestPhone)
        .eq("tenant_id", tenantId)
        .maybeSingle();
      guestId = existing?.id || null;
    }

    if (!guestId) {
      const { data: inserted, error: guestError } = await supabase
        .from("guests")
        .insert({
          tenant_id: tenantId,
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
        tenant_id: tenantId,
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

    // Log Booking Created
    await logEvent({
      tenant_id: tenantId,
      actor_type: 'user',
      actor_id: user.id,
      event_type: EVENT_TYPES.BOOKING_CREATED,
      entity_type: 'booking',
      entity_id: booking.id,
      metadata: { amount, listingId }
    });

    // 1. Create Payment Record first to get ID
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        tenant_id: tenantId,
        booking_id: booking.id,
        provider: "razorpay",
        amount,
        status: "pending",
        payment_link: "", // Placeholder, updated below
        paid_at: null,
        created_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (paymentError || !payment) {
      // Rollback booking? Or just fail? 
      // Ideally rollback, but for now return error
      return NextResponse.json({ error: paymentError?.message || "Failed to create payment record" }, { status: 500 });
    }

    // 2. Create Razorpay Payment Link with internal_payment_id in notes
    let paymentLinkData;
    try {
      paymentLinkData = await RazorpayService.createPaymentLink(tenantId, {
        amount: amount, // Service handles * 100 conversion
        currency: "INR",
        description: `Booking for ${listing.title || listing.name} (${checkIn} to ${checkOut})`,
        customer: {
          name: guestName,
          email: guestEmail || undefined,
          contact: guestPhone || undefined
        },
        reference_id: booking.id,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings/${booking.id}/confirmation`,
        notes: {
          internal_payment_id: payment.id,
          booking_id: booking.id,
          tenant_id: tenantId
        }
      });
    } catch (rzpError: any) {
      console.error("Razorpay Error:", rzpError);
      // Update payment status to failed?
      await supabase.from("payments").update({ status: "failed", metadata: { error: rzpError.message } }).eq("id", payment.id);
      return NextResponse.json({ error: "Failed to create payment link: " + rzpError.message }, { status: 502 });
    }

    const paymentLink = paymentLinkData.short_url;
    
    // 3. Update Payment Record with Link
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        payment_link: paymentLink,
        payment_link_id: paymentLinkData.id
      })
      .eq("id", payment.id);

    if (updateError) {
       console.error("Failed to update payment with link", updateError);
       // Non-critical if link was generated, but bad for UI.
    }

    // Log Payment Link Created
    await logEvent({
      tenant_id: tenantId,
      actor_type: 'user',
      actor_id: user.id,
      event_type: EVENT_TYPES.PAYMENT_LINK_CREATED,
      entity_type: 'payment',
      entity_id: payment.id,
      metadata: { amount, bookingId: booking.id, paymentLinkId: paymentLinkData.id }
    });

    return NextResponse.json({ 
      success: true, 
      paymentLink, 
      bookingId: booking.id,
      paymentId: payment.id
    });
  } catch (error: any) {
    console.error("Payment Link Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
