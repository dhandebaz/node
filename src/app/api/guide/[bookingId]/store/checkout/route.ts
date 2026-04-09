import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { RazorpayService } from "@/lib/services/razorpayService";

export async function POST(
  req: Request
) {
  try {
    const { items, totalAmount, tenantId } = await req.json();
    const urlMatches = req.url.match(/guide\/([^\/]+)\/store/);
    const bookingId = urlMatches ? urlMatches[1] : null;

    if (!bookingId || !tenantId || !items || !totalAmount) {
      return NextResponse.json({ error: "Missing required details" }, { status: 400 });
    }

    // Initialize Razorpay Order via Nodebase razorpay wrapper
    // amount expects paise/cents, we will convert standard decimal to integer
    const order = await RazorpayService.createOrder(tenantId, {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${bookingId}_${Date.now()}`,
      notes: {
        bookingId,
        itemsCount: items.length
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Upsell checkout error:", error);
    return NextResponse.json({ error: error.message || "Failed to initialize checkout" }, { status: 500 });
  }
}
