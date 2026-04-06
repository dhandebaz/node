import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { parseICal } from "@/lib/ical";
import { WalletService } from "@/lib/services/walletService";
import { PricingService } from "@/lib/services/pricingService";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { ControlService } from "@/lib/services/controlService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: listingId } = await params;
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tenantId = await requireActiveTenant();

    // Check kill switch
    try {
      await ControlService.checkAction(tenantId, "sync");
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }

    const { platform, url } = await request.json();
    if (!platform || !url) {
      return NextResponse.json({ error: "Platform and URL are required" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // 1. Verify listing ownership
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, tenant_id")
      .eq("id", listingId)
      .eq("host_id", session.userId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (listingError) throw listingError;
    if (!listing) return NextResponse.json({ error: "Listing not found or access denied" }, { status: 404 });

    // 2. Upsert the integration
    const { error: upsertError } = await supabase
      .from("listing_integrations")
      .upsert({
        listing_id: listingId,
        platform: platform,
        external_ical_url: url,
        status: "connected",
        last_synced_at: new Date().toISOString(),
      });

    if (upsertError) throw upsertError;

    // 3. Perform initial sync
    // priced per sync action
    const SYNC_COST_TOKEN_UNITS = 50;
    const cost = await PricingService.calculateCost("integration_sync", SYNC_COST_TOKEN_UNITS, tenantId);
    
    const hasBalance = await WalletService.hasSufficientBalance(tenantId, cost);
    if (!hasBalance) {
      return NextResponse.json({ error: "Insufficient balance for first sync" }, { status: 402 });
    }

    await WalletService.deductCredits(tenantId, cost, "integration_sync", {
      listing_id: listingId,
      platform,
    });

    // Fetch and parse
    const icalRes = await fetch(url, {
      headers: { "User-Agent": "Nodebase-CalendarSync/1.0" },
    });

    if (!icalRes.ok) throw new Error(`Failed to fetch iCal: ${icalRes.statusText}`);

    const icalText = await icalRes.text();
    const events = parseICal(icalText);
    const today = new Date().toISOString().split("T")[0];

    // Delete existing future bookings for this specific platform
    await supabase
      .from("bookings")
      .delete()
      .eq("listing_id", listingId)
      .eq("source", platform)
      .gte("start_date", today);

    // Filter valid future events
    const validEvents = events.filter((e) => e.startDate && e.endDate && e.endDate.getTime() > Date.now());

    let importedCount = 0;
    if (validEvents.length > 0) {
      // Get or Create generic External Guest
      let { data: guest } = await supabase
        .from("guests")
        .select("id")
        .eq("email", `external@${platform}.com`)
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (!guest) {
        const { data: newGuest, error: guestError } = await supabase
          .from("guests")
          .insert({
            tenant_id: tenantId,
            name: `${platform} Guest`,
            email: `external@${platform}.com`,
            phone: "0000000000",
          })
          .select("id")
          .single();

        if (guestError) throw guestError;
        guest = newGuest;
      }

      const bookingsToInsert = validEvents.map((e) => ({
        tenant_id: tenantId,
        listing_id: listingId,
        guest_id: guest!.id,
        start_date: e.startDate.toISOString(),
        end_date: e.endDate.toISOString(),
        status: "confirmed" as const,
        source: platform,
        amount: 0,
      }));

      const { error: insertError } = await supabase.from("bookings").insert(bookingsToInsert);
      if (insertError) throw insertError;
      importedCount = bookingsToInsert.length;
    }

    await logEvent({
      tenant_id: tenantId,
      actor_type: "user",
      actor_id: session.userId,
      event_type: EVENT_TYPES.SYSTEM_CALENDAR_SYNC,
      entity_type: "listing",
      entity_id: listingId,
      metadata: { platform, url, count: importedCount, cost },
    });

    return NextResponse.json({ success: true, count: importedCount });
  } catch (error: any) {
    console.error("[Sync Import] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}