import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || 'unknown';
    const { success } = await rateLimit.limit(`payment_screenshot_${ip}`);
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const formData = await request.formData();
    const paymentLinkId = formData.get("paymentLinkId")?.toString();
    const screenshotBase64 = formData.get("screenshot")?.toString();

    if (!paymentLinkId || !screenshotBase64) {
      return NextResponse.json({ error: "Missing paymentLinkId or screenshot" }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();

    // Verify payment link exists and belongs to tenant
    const { data: paymentLink, error: linkError } = await supabase
      .from("payment_links")
      .select("id, tenant_id, status")
      .eq("id", paymentLinkId)
      .single();

    if (linkError || !paymentLink) {
      return NextResponse.json({ error: "Payment link not found" }, { status: 404 });
    }

    if (paymentLink.status === "paid") {
      return NextResponse.json({ error: "Payment already confirmed" }, { status: 400 });
    }

    // Upload screenshot to storage
    const base64 = screenshotBase64.replace(/^data:image\/\w+;base64,/, '');
    const fileName = `payment-screenshots/${paymentLinkId}_${Date.now()}.png`;
    
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, Buffer.from(base64, 'base64'), {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error("Screenshot upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload screenshot" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);

    const screenshotUrl = urlData.publicUrl;

    // Update payment link with screenshot and pending verification status
    const { error: updateError } = await supabase
      .from("payment_links")
      .update({
        status: "pending_verification",
        metadata: {
          ...(paymentLink as any).metadata,
          payment_screenshot_url: screenshotUrl,
          payment_submitted_at: new Date().toISOString()
        }
      })
      .eq("id", paymentLinkId);

    if (updateError) {
      console.error("Failed to update payment link:", updateError);
      return NextResponse.json({ error: "Failed to submit payment" }, { status: 500 });
    }

    // Log the payment screenshot submission
    const { logEvent } = await import("@/lib/events");
    const { EVENT_TYPES } = await import("@/types/events");
    
    await logEvent({
      tenant_id: paymentLink.tenant_id,
      actor_type: 'user',
      event_type: EVENT_TYPES.PAYMENT_SUBMITTED,
      entity_type: 'payment_link',
      entity_id: paymentLinkId,
      metadata: { screenshot_url: screenshotUrl }
    });

    return NextResponse.json({
      success: true,
      status: "pending_verification",
      message: "Payment screenshot submitted. Host will verify shortly."
    });

  } catch (error: any) {
    console.error("Payment screenshot upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentLinkId = searchParams.get("paymentLinkId");

    if (!paymentLinkId) {
      return NextResponse.json({ error: "Missing paymentLinkId" }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();

    const { data: paymentLink, error } = await supabase
      .from("payment_links")
      .select("status, metadata")
      .eq("id", paymentLinkId)
      .single();

    if (error || !paymentLink) {
      return NextResponse.json({ error: "Payment link not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: paymentLink.status,
      screenshotUrl: (paymentLink.metadata as any)?.payment_screenshot_url || null,
      submittedAt: (paymentLink.metadata as any)?.payment_submitted_at || null
    });

  } catch (error: any) {
    console.error("Payment status check error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
