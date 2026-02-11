import { NextResponse } from 'next/server';
import { requireActiveTenant } from "@/lib/auth/tenant";
import { RazorpayService } from "@/lib/services/razorpayService";

export async function POST(request: Request) {
  try {
    const tenantId = await requireActiveTenant();
    const { amount } = await request.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Minimum top-up amount is ₹100" }, { status: 400 });
    }

    const receipt = `rcpt_${tenantId.slice(0, 8)}_${Date.now()}`;
    const order = await RazorpayService.createOrder(amount, 'INR', receipt);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });

  } catch (error: any) {
    console.error("Top-up Create Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
