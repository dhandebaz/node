import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { RazorpayService } from "@/lib/services/razorpayService";
import { ControlService } from "@/lib/services/controlService";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { getAppUrl } from "@/lib/runtime-config";

interface CreateLinkPayload {
  amount: number;
  currency?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  referenceId?: string;
  callbackUrl?: string;
  notes?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();

    // Check payments kill switch
    try {
      await ControlService.checkAction(tenantId, "payment");
    } catch (e: any) {
      return NextResponse.json(
        { error: e.message },
        { status: e?.status || 503 },
      );
    }

    const body = (await request.json()) as CreateLinkPayload;

    const amount = Number(body?.amount);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "A valid amount is required" },
        { status: 400 },
      );
    }

    const currency = body.currency || "INR";
    const description = body.description || "Payment via Nodebase";
    const appUrl = getAppUrl();
    const callbackUrl = body.callbackUrl || `${appUrl}/dashboard`;

    // Create the Razorpay payment link
    const paymentLinkData = await RazorpayService.createPaymentLink(tenantId, {
      amount,
      currency,
      description,
      customer: {
        name: body.customerName || "Guest",
        email: body.customerEmail || undefined,
        contact: body.customerPhone || undefined,
      },
      reference_id: body.referenceId || `link_${tenantId}_${Date.now()}`,
      callback_url: callbackUrl,
      notes: {
        ...body.notes,
        tenant_id: tenantId,
        created_by: user.id,
      },
    });

    const paymentLink = paymentLinkData.short_url;

    // Persist the payment link record
    const { data: linkRecord, error: insertError } = await supabase
      .from("payments")
      .insert({
        tenant_id: tenantId,
        provider: "razorpay",
        amount,
        status: "pending",
        payment_link: paymentLink,
        payment_link_id: paymentLinkData.id,
        paid_at: null,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to persist payment link record:", insertError);
      // Non-fatal  -  the link was created, just log the error
    }

    // Log event
    await logEvent({
      tenant_id: tenantId,
      actor_type: "user",
      actor_id: user.id,
      event_type: EVENT_TYPES.PAYMENT_LINK_CREATED,
      entity_type: "payment",
      entity_id: linkRecord?.id || paymentLinkData.id,
      metadata: {
        amount,
        currency,
        paymentLinkId: paymentLinkData.id,
        referenceId: body.referenceId,
      },
    });

    return NextResponse.json({
      success: true,
      link: paymentLink,
      paymentLinkId: paymentLinkData.id,
      recordId: linkRecord?.id || null,
    });
  } catch (error: any) {
    console.error("Payment link creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create payment link" },
      { status: error?.status || 500 },
    );
  }
}
