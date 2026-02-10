import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

type Payload = {
  paymentId?: string;
  status?: "paid" | "failed" | "expired" | "refunded";
  paidAt?: string | null;
};

export async function POST(request: Request) {
  try {
    // Webhook needs admin access to bypass RLS since it comes from external system (no user session)
    const supabase = await getSupabaseAdmin();
    const body = (await request.json()) as Payload;
    const paymentId = body?.paymentId;
    const status = body?.status;

    if (!paymentId || !status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Log the raw webhook event first (System Action)
    // We don't know tenant_id yet, but we can try to fetch it first or log it with null tenant
    // Ideally we fetch the payment first to get tenant_id.

    const paidAt = status === "paid" ? body?.paidAt || new Date().toISOString() : null;
    
    // Fetch payment to get tenant_id and booking_id
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("id, tenant_id, booking_id, amount")
      .eq("id", paymentId)
      .single();

    if (fetchError || !payment) {
      console.error("Payment webhook error: Payment not found", paymentId);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const tenantId = payment.tenant_id;

    // Log Webhook Received
    await logEvent({
      tenant_id: tenantId,
      actor_type: 'system',
      event_type: EVENT_TYPES.SYSTEM_WEBHOOK_RECEIVED,
      entity_type: 'payment',
      entity_id: paymentId,
      metadata: { status, payload: body }
    });

    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status,
        paid_at: paidAt
      })
      .eq("id", paymentId);

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    if (status === "paid") {
      // Log Payment Confirmed
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'system',
        event_type: EVENT_TYPES.PAYMENT_CONFIRMED,
        entity_type: 'payment',
        entity_id: paymentId,
        metadata: { amount: payment.amount }
      });

      await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", payment.booking_id);
      
      // Log Booking Confirmed
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'system',
        event_type: EVENT_TYPES.BOOKING_CONFIRMED,
        entity_type: 'booking',
        entity_id: payment.booking_id,
        metadata: { payment_id: paymentId }
      });

      const { data: booking } = await supabase
        .from("bookings")
        .select("listing_id, guest_id, start_date, end_date, guest_contact")
        .eq("id", payment.booking_id)
        .maybeSingle();

      if (booking?.listing_id && booking?.guest_id) {
        const startLabel = new Date(booking.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        const endLabel = new Date(booking.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        const content = `Booking confirmed. Your stay from ${startLabel} to ${endLabel} is locked. You will receive details shortly.`;
        
        await supabase.from("messages").insert({
          tenant_id: tenantId, // Ensure tenant_id is set
          listing_id: booking.listing_id,
          guest_id: booking.guest_id,
          channel: "whatsapp",
          direction: "outbound",
          content,
          is_read: false,
          timestamp: new Date().toISOString()
        });

        // Log AI Reply Sent (or System Message Sent)
        // User classified this as "AI_REPLY_SENT" or just "Message"?
        // It's a system automated message.
        // We can use AI_REPLY_SENT or maybe add SYSTEM_MESSAGE_SENT.
        // Let's stick to AI_REPLY_SENT if it's considered an AI/Automated action, or just leave it for now.
        // Actually, let's log it as AI_REPLY_SENT with actor=system
        await logEvent({
          tenant_id: tenantId,
          actor_type: 'system',
          event_type: EVENT_TYPES.AI_REPLY_SENT,
          entity_type: 'message',
          metadata: { channel: 'whatsapp', trigger: 'booking_confirmed' }
        });
      }
    }

    if (status === "refunded") {
      await supabase
        .from("bookings")
        .update({ status: "refunded" })
        .eq("id", payment.booking_id);
        
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'system',
        event_type: EVENT_TYPES.BOOKING_CANCELLED,
        entity_type: 'booking',
        entity_id: payment.booking_id,
        metadata: { reason: 'payment_refunded' }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to handle webhook" }, { status: 500 });
  }
}
