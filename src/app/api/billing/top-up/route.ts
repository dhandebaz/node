import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { RazorpayService } from "@/lib/services/razorpayService";

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();
    const body = await request.json();
    const { credits } = body;

    if (!credits || credits < 100) {
        return NextResponse.json({ error: "Minimum 100 credits required" }, { status: 400 });
    }

    // Pricing Logic (can be moved to PricingService)
    // 1 Credit = 1 INR
    const pricePerCredit = 1; 
    const amountINR = credits * pricePerCredit;
    const amountPaise = amountINR * 100;

    const order = await RazorpayService.createOrder(tenantId, {
        amount: amountPaise,
        currency: "INR",
        receipt: `topup_${tenantId}_${Date.now()}`,
        notes: {
            tenantId,
            credits: credits.toString(),
            type: "top_up"
        }
    });

    return NextResponse.json({
        orderId: order.id,
        amount: amountINR,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error("Top Up Error:", error);
    return NextResponse.json({ error: error.message || "Failed to initiate top up" }, { status: 500 });
  }
}
