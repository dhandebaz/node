import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { RazorpayService } from "@/lib/services/razorpayService";

export async function POST(request: Request) {
  try {
    const tenantId = await requireActiveTenant();
    const body = await request.json();
    const { amount } = body; // Amount in INR (Major Unit)

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Minimum top-up amount is ₹100" }, { status: 400 });
    }

    // Create Order
    // Amount must be in paise (x100)
    const order = await RazorpayService.createOrder(tenantId, {
      amount: amount * 100,
      currency: "INR",
      receipt: `topup_${tenantId}_${Date.now()}`,
      notes: {
        tenantId,
        type: "wallet_topup",
        credits: String(amount) // 1 INR = 1 Credit logic
      }
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error: any) {
    console.error("Top-up Order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
