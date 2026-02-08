import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: bookingRows } = await supabase
      .from("bookings")
      .select("id, listings!inner(host_id)")
      .eq("listings.host_id", user.id);

    const bookingIds = (bookingRows || []).map((b: any) => b.id);

    if (!bookingIds.length) {
      return NextResponse.json({ items: [] });
    }

    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("id, status, amount, created_at, paid_at, booking_id")
      .in("booking_id", bookingIds)
      .order("created_at", { ascending: false })
      .limit(6);

    if (paymentsError) {
      return NextResponse.json({ error: paymentsError.message }, { status: 500 });
    }

    const items = (payments || []).map((payment: any) => {
      const status = payment.status || "pending";
      const timestamp = payment.paid_at || payment.created_at;
      return {
        id: `pay-${payment.id}`,
        timestamp,
        action: status === "paid" ? "Payment confirmed" : "Payment update",
        reason: status === "paid" ? "Guest completed payment" : `Payment ${status}`,
        outcome: status,
        manager: "Host AI"
      };
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load AI activity" }, { status: 500 });
  }
}
