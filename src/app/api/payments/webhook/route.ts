import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { log } from "@/lib/logger";
import { EVENT_TYPES } from "@/types/events";
import { ChannelService } from "@/lib/services/channelService";

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
      log.error("Payment webhook error: Payment not found", fetchError, { paymentId });
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
        tenant_id: tenantId as string,
        actor_type: "system",
        event_type: EVENT_TYPES.PAYMENT_CONFIRMED,
        entity_type: "payment",
        entity_id: paymentId,
        metadata: { amount: payment.amount },
      });

      if (payment.booking_id) {
        await supabase
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", payment.booking_id as string);

        // Log Booking Confirmed
        await logEvent({
          tenant_id: tenantId as string,
          actor_type: "system",
          event_type: EVENT_TYPES.BOOKING_CONFIRMED,
          entity_type: "booking",
          entity_id: payment.booking_id as string,
          metadata: { payment_id: paymentId },
        });

        const { data: booking } = await supabase
          .from("bookings")
          .select(
            `
          listing_id, 
          guest_id, 
          start_date, 
          end_date, 
          guest_contact,
          guests (
            channel,
            phone
          )
        `,
          )
          .eq("id", payment.booking_id as string)
          .maybeSingle();

        const guestData = (booking as any)?.guests;
        const channel = guestData?.channel || "whatsapp";
        const recipientId = guestData?.phone || (booking as any)?.guest_id;

        if (booking?.listing_id && booking?.guest_id) {
          const startLabel = new Date(booking.start_date as string).toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "short" },
          );
          const endLabel = new Date(booking.end_date as string).toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "short" },
          );
          const content = `Booking confirmed. Your stay from ${startLabel} to ${endLabel} is locked. You will receive details shortly.`;

          await supabase.from("messages").insert({
            tenant_id: tenantId,
            listing_id: booking.listing_id,
            guest_id: booking.guest_id,
            role: "assistant", // System automated assistant
            channel,
            direction: "outbound",
            content,
            metadata: { read: false, trigger: "booking_confirmed" },
            created_at: new Date().toISOString(),
          });

          // Dispatch to external channel
          try {
            await ChannelService.sendMessage({
              tenantId: tenantId as string,
              recipientId: recipientId as string,
              content,
              channel: channel as any,
            });
          } catch (dispatchError) {
            log.error("Dispatch confirmed message error", dispatchError, {
              tenantId,
              recipientId,
              channel,
            });
          }

          // Log AI Reply Sent
          await logEvent({
            tenant_id: tenantId as string,
            actor_type: "system",
            event_type: EVENT_TYPES.AI_REPLY_SENT,
            entity_type: "message",
            metadata: { channel, trigger: "booking_confirmed" },
          });
        }
      }
    }

    if (status === "refunded" && payment.booking_id) {
      await supabase
        .from("bookings")
        .update({ status: "refunded" })
        .eq("id", payment.booking_id as string);

      await logEvent({
        tenant_id: tenantId as string,
        actor_type: "system",
        event_type: EVENT_TYPES.BOOKING_CANCELLED,
        entity_type: "booking",
        entity_id: payment.booking_id as string,
        metadata: { reason: "payment_refunded" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    log.error("Payment webhook handling failed", error as Error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
