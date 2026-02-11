import { NextResponse } from 'next/server';
import { requireActiveTenant } from "@/lib/auth/tenant";
import { RazorpayService } from "@/lib/services/razorpayService";
import { WalletService } from "@/lib/services/walletService";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

export async function POST(request: Request) {
  try {
    const tenantId = await requireActiveTenant();
    const body = await request.json();
    
    // Support both frontend camelCase and standard Razorpay snake_case
    const razorpay_order_id = body.razorpay_order_id || body.orderId;
    const razorpay_payment_id = body.razorpay_payment_id || body.paymentId;
    const razorpay_signature = body.razorpay_signature || body.signature;
    const amount = body.amount || body.credits;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // 1. Verify Signature
    const isValid = RazorpayService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (!isValid) {
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'user',
        event_type: EVENT_TYPES.ACTION_BLOCKED, // Or a specific PAYMENT_FAILED event
        entity_type: 'payment',
        entity_id: razorpay_order_id,
        metadata: { reason: "Invalid signature" }
      });
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Credit Wallet (Idempotent)
    // We pass paymentId in metadata for idempotency check in WalletService
    const success = await WalletService.topUp(tenantId, Number(amount), "Credit Top Up via Razorpay", {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      provider: 'razorpay'
    });

    if (!success) {
        throw new Error("Failed to credit wallet");
    }

    // 3. Log Success
    await logEvent({
        tenant_id: tenantId,
        actor_type: 'user',
        event_type: EVENT_TYPES.PAYMENT_CONFIRMED,
        entity_type: 'wallet',
        entity_id: tenantId,
        metadata: { 
            amount, 
            paymentId: razorpay_payment_id 
        }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Top-up Verify Error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify payment" }, { status: 500 });
  }
}
