import { NextResponse } from "next/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { RazorpayService } from "@/lib/services/razorpayService";
import { getRazorpayKeyId } from "@/lib/runtime-config";

export async function POST(request: Request) {
  try {
    const tenantId = await requireActiveTenant();
    const { plan } = await request.json();

    if (!plan || !["pro", "business"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 },
      );
    }

    const subscription = await RazorpayService.createSubscription(
      plan,
      tenantId,
    );
    const razorpayKeyId = getRazorpayKeyId();

    // If mocked or created
    return NextResponse.json({
      subscriptionId: subscription.id,
      id: subscription.id,
      keyId: razorpayKeyId,
      key_id: razorpayKeyId,
      plan_id: subscription.plan_id,
    });
  } catch (error: any) {
    console.error("Subscription Create Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 },
    );
  }
}
