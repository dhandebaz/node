import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

type Payload = {
  paymentId?: string;
  status?: "paid" | "failed" | "expired" | "refunded";
  paidAt?: string | null;
};

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer();
    const body = (await request.json()) as Payload;
    const paymentId = body?.paymentId;
    const status = body?.status;

    if (!paymentId || !status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const paidAt = status === "paid" ? body?.paidAt || new Date().toISOString() : null;
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({
        status,
        paid_at: paidAt
      })
      .eq("id", paymentId)
      .select("booking_id")
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: paymentError?.message || "Payment not found" }, { status: 404 });
    }

    if (status === "paid") {
      await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", payment.booking_id);

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
          listing_id: booking.listing_id,
          guest_id: booking.guest_id,
          channel: "whatsapp",
          direction: "outbound",
          content,
          is_read: false,
          timestamp: new Date().toISOString()
        });
      }
    }

    if (status === "refunded") {
      await supabase
        .from("bookings")
        .update({ status: "refunded" })
        .eq("id", payment.booking_id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to handle webhook" }, { status: 500 });
  }
}
