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

    const supabase = await getSupabaseServer();

    // Verify listing ownership
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, tenant_id")
      .eq("id", listingId)
      .eq("host_id", session.userId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (listingError) {
      return NextResponse.json(
        { error: listingError.message },
        { status: 500 },
      );
    }
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found or access denied" },
        { status: 404 },
      );
    }

    // Fetch all connected integrations with an external iCal URL
    const { data: integrations, error: integrationsError } = await supabase
      .from("listing_integrations")
      .select("platform, external_ical_url, status")
      .eq("listing_id", listingId)
      .not("external_ical_url", "is", null);

    if (integrationsError) {
      return NextResponse.json(
        { error: integrationsError.message },
        { status: 500 },
      );
    }

    if (!integrations || integrations.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message:
            "No connected iCal sources found for this listing. Add an external iCal URL first.",
          synced: 0,
          skipped: 0,
        },
        { status: 200 },
      );
    }

    // Charge for the sync — priced per platform synced
    const SYNC_TOKEN_EQUIVALENT = 50;
    const cost = await PricingService.calculateCost(
      "integration_sync",
      SYNC_TOKEN_EQUIVALENT * integrations.length,
      tenantId,
    );

    const hasBalance = await WalletService.hasSufficientBalance(tenantId, cost);
    if (!hasBalance) {
      return NextResponse.json(
        { error: "Insufficient credits for sync" },
        { status: 402 },
      );
    }

    await WalletService.deductCredits(tenantId, cost, "integration_sync", {
      listing_id: listingId,
      platform: "all",
      count: integrations.length,
    });

    const today = new Date().toISOString().split("T")[0];
    const results: {
      platform: string;
      imported: number;
      error?: string;
    }[] = [];

    for (const integration of integrations) {
      const { platform, external_ical_url } = integration;

      try {
        // Fetch the iCal feed
        const icalRes = await fetch(external_ical_url, {
          headers: { "User-Agent": "Nodebase-CalendarSync/1.0" },
        });

        if (!icalRes.ok) {
          throw new Error(
            `HTTP ${icalRes.status} fetching iCal for ${platform}`,
          );
        }

        const icalText = await icalRes.text();
        const events = parseICal(icalText);

        // Wipe future bookings for this platform and re-insert
        const { error: deleteError } = await supabase
          .from("bookings")
          .delete()
          .eq("listing_id", listingId)
          .eq("source", platform)
          .gte("start_date", today);

        if (deleteError) throw deleteError;

        const validEvents = events.filter(
          (e) => e.startDate && e.endDate && e.endDate.getTime() > Date.now(),
        );

        if (validEvents.length > 0) {
          // Get or create a placeholder external guest for this platform
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
            status: "confirmed",
            source: platform,
            amount: 0,
          }));

          const { error: insertError } = await supabase
            .from("bookings")
            .insert(bookingsToInsert);

          if (insertError) throw insertError;
        }

        // Mark integration as synced
        await supabase
          .from("listing_integrations")
          .update({
            status: "connected",
            last_synced_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("listing_id", listingId)
          .eq("platform", platform);

        results.push({ platform, imported: validEvents.length });
      } catch (err: any) {
        console.error(`[Sync Push] Failed for platform ${platform}:`, err);

        // Mark the integration as errored without failing the whole batch
        await supabase
          .from("listing_integrations")
          .update({
            status: "error",
            last_synced_at: new Date().toISOString(),
            error_message: err.message || "Unknown error",
          })
          .eq("listing_id", listingId)
          .eq("platform", platform);

        results.push({ platform, imported: 0, error: err.message });
      }
    }

    const syncedCount = results.filter((r) => !r.error).length;
    const errorCount = results.filter((r) => !!r.error).length;

    await logEvent({
      tenant_id: tenantId,
      actor_type: "user",
      actor_id: session.userId,
      event_type: EVENT_TYPES.SYSTEM_CALENDAR_SYNC,
      entity_type: "listing",
      entity_id: listingId,
      metadata: {
        type: "push_sync",
        results,
        synced: syncedCount,
        errors: errorCount,
        cost,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} of ${integrations.length} platform(s).`,
      synced: syncedCount,
      failed: errorCount,
      results,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Sync Push] Unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "Sync failed" },
      { status: 500 },
    );
  }
}
