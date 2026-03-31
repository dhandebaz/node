import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const supabase = await getSupabaseServer();

    let query = supabase
      .from("payment_links")
      .select(`
        id,
        status,
        amount,
        created_at,
        expires_at,
        metadata,
        conversation_id,
        listing_id,
        guests(name, phone, email),
        listings(title)
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: payments, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (payments || []).map((p: any) => {
      const guest = Array.isArray(p.guests) ? p.guests[0] : p.guests;
      const listing = Array.isArray(p.listings) ? p.listings[0] : p.listings;
      return {
        id: p.id,
        status: p.status,
        amount: Number(p.amount || 0),
        guestName: guest?.name || "Guest",
        guestPhone: guest?.phone,
        guestEmail: guest?.email,
        listingTitle: listing?.title,
        screenshotUrl: p.metadata?.payment_screenshot_url || null,
        submittedAt: p.metadata?.payment_submitted_at || null,
        createdAt: p.created_at,
        expiresAt: p.expires_at
      };
    });

    return NextResponse.json({ payments: formatted });
  } catch (error: any) {
    console.error("Get pending payments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    const body = await request.json();
    const { paymentLinkId, action, reason } = body;

    if (!paymentLinkId || !action) {
      return NextResponse.json({ error: "paymentLinkId and action required" }, { status: 400 });
    }

    if (!["verify", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Use 'verify' or 'reject'" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // Verify payment link belongs to tenant
    const { data: paymentLink, error: fetchError } = await supabase
      .from("payment_links")
      .select("id, status, tenant_id, metadata, conversation_id")
      .eq("id", paymentLinkId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !paymentLink) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (paymentLink.status !== "pending_verification") {
      return NextResponse.json({ error: "Payment is not pending verification" }, { status: 400 });
    }

    if (action === "verify") {
      // Update payment link status to paid
      const { error: updateError } = await supabase
        .from("payment_links")
        .update({ status: "paid" })
        .eq("id", paymentLinkId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Log verification event
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'user',
        event_type: EVENT_TYPES.PAYMENT_VERIFIED,
        entity_type: 'payment_link',
        entity_id: paymentLinkId,
        metadata: {
          screenshot_url: (paymentLink.metadata as any)?.payment_screenshot_url
        }
      });

      return NextResponse.json({ success: true, status: "paid" });
    }

    if (action === "reject") {
      // Update payment link status back to active (guest can resubmit)
      const { error: updateError } = await supabase
        .from("payment_links")
        .update({ 
          status: "active",
          metadata: {
            ...(paymentLink.metadata as any),
            payment_rejected: true,
            rejection_reason: reason || "Payment verification failed",
            payment_rejected_at: new Date().toISOString()
          }
        })
        .eq("id", paymentLinkId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Log rejection event
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'user',
        event_type: EVENT_TYPES.PAYMENT_REJECTED,
        entity_type: 'payment_link',
        entity_id: paymentLinkId,
        metadata: { reason }
      });

      return NextResponse.json({ success: true, status: "active" });
    }

  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
