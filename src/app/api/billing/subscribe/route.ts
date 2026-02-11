import { NextResponse } from 'next/server';
import { requireActiveTenant } from "@/lib/auth/tenant";
import { RazorpayService } from "@/lib/services/razorpayService";

export async function POST(request: Request) {
  try {
    const tenantId = await requireActiveTenant();
    const { plan } = await request.json();

    if (!plan || !['pro', 'business'].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const subscription = await RazorpayService.createSubscription(plan, tenantId);

    // If mocked or created
    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan_id: subscription.plan_id
    });

  } catch (error: any) {
    console.error("Subscription Create Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 });
  }
}
