import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { FailureService } from "@/lib/services/failureService";
import { ControlService } from "@/lib/services/controlService";
import { WalletService } from "@/lib/services/walletService";
import { PricingService } from "@/lib/services/pricingService";

const getBaseUrl = (req: NextRequest) => {
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  return `${protocol}://${host}`;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tenantId = await requireActiveTenant();

    let syncDisabled = false;
    try {
      await ControlService.checkAction(tenantId, "sync");
    } catch {
      syncDisabled = true;
    }

    const { id: listingId } = await params;
    const supabase = await getSupabaseServer();

    const { data: listing, error } = await supabase
      .from("listings")
      .select("id")
      .eq("id", listingId)
      .eq("host_id", session.userId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const [{ data: integrations }, { data: calendar }] = await Promise.all([
      supabase
        .from("listing_integrations")
        .select(
          "listing_id, platform, external_ical_url, last_synced_at, status",
        )
        .eq("listing_id", listingId),
      supabase
        .from("listing_calendars")
        .select("listing_id, nodebase_ical_url")
        .eq("listing_id", listingId)
        .maybeSingle(),
    ]);

    const connectedIntegrations = (integrations || []).filter(
      (integration: any) => integration.external_ical_url,
    );
    const lastSyncedAt =
      (integrations || [])
        .map((integration: any) => integration.last_synced_at)
        .filter(Boolean)
        .sort()
        .slice(-1)[0] || null;
    const hasError = (integrations || []).some(
      (integration: any) => integration.status === "error",
    );
    const status = syncDisabled
      ? "disabled"
      : hasError
        ? "error"
        : connectedIntegrations.length === 0
          ? "not_connected"
          : lastSyncedAt
            ? "connected"
            : "never_synced";

    // Failure Handling
    if (hasError) {
      const failedIntegrations = (integrations || []).filter(
        (i: any) => i.status === "error",
      );
      for (const failed of failedIntegrations) {
        await FailureService.raiseFailure({
          tenant_id: tenantId,
          category: "calendar",
          source: failed.platform || "unknown",
          severity: "warning",
          message: `Calendar sync failed for ${failed.platform}`,
          metadata: { listing_id: listingId, platform: failed.platform },
        });
      }
    } else {
      // Resolve potential failures if everything is green
      // We don't know exact source easily here without iterating platforms,
      // but we can resolve if we see a 'connected' one.
      for (const connected of connectedIntegrations) {
        if (connected.status === "connected") {
          await FailureService.resolveFailure(
            tenantId,
            connected.platform || "unknown",
            "calendar",
          );
        }
      }
    }

    // Fetch real bookings from DB
    const { data: dbBookings } = await supabase
      .from("bookings")
      .select(
        "id, listing_id, tenant_id, guest_id, guest_name, start_date, end_date, status, source, amount, created_at, guest_contact",
      )
      .eq("listing_id", listingId)
      .neq("status", "cancelled");

    // Log the calendar sync check/pull
    // Note: In a real system, this might be where we trigger the sync or report on the background sync
    if (!syncDisabled) {
      await logEvent({
        tenant_id: tenantId,
        actor_type: "system",
        event_type: EVENT_TYPES.SYSTEM_CALENDAR_SYNC,
        entity_type: "listing",
        entity_id: listingId,
        metadata: {
          status,
          connected_count: connectedIntegrations.length,
          last_synced_at: lastSyncedAt,
        },
      });
    }

    const nodebaseIcalUrl =
      calendar?.nodebase_ical_url ||
      `${getBaseUrl(request)}/api/public/ical/${listingId}`;

    return NextResponse.json({
      calendar: {
        listingId,
        nodebaseIcalUrl,
      },
      integrations: (integrations || []).map((integration: any) => ({
        listingId,
        platform: integration.platform,
        externalIcalUrl: integration.external_ical_url || null,
        lastSyncedAt: integration.last_synced_at || null,
        status: integration.status || "not_connected",
      })),
      lastSyncedAt,
      status,
      bookings: (dbBookings || []).map((b: any) => ({
        id: b.id,
        tenantId: b.tenant_id,
        listingId: b.listing_id,
        guestName: b.guest_name || "Guest",
        startDate: b.start_date,
        endDate: b.end_date,
        status: b.status,
        source: b.source,
        amount: b.amount,
        createdAt: b.created_at,
        guestContact: b.guest_contact,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tenantId = await requireActiveTenant();
    const { id: listingId } = await params;

    // Check Control Service
    try {
      await ControlService.checkAction(tenantId, "sync");
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }

    // Cost Calculation & Balance Check
    // 'calendar_sync' is usually a cheaper action, but depends on pricing rules
    const estimatedCost = await PricingService.calculateCost(
      "calendar_sync",
      1000,
      tenantId,
    ); // 1000 tokens weight
    const hasBalance = await WalletService.hasSufficientBalance(
      tenantId,
      estimatedCost,
    );

    if (!hasBalance) {
      await logEvent({
        tenant_id: tenantId || "",
        listing_id: listingId,
        event_type: 'calendar_sync',
        entity_type: 'listing',
        entity_id: listingId,
        metadata: { 
          source: 'external_ical', 
          count: 0,
          sync_url: ""
        }
      } as any);
      return NextResponse.json(
        { error: "Insufficient credits for calendar sync." },
        { status: 402 },
      );
    }

    const supabase = await getSupabaseServer();

    // Fetch all connected integrations with an external iCal URL
    const { data: integrations, error: intError } = await supabase
      .from("listing_integrations")
      .select("platform, external_ical_url, status")
      .eq("listing_id", listingId)
      .not("external_ical_url", "is", null);

    if (intError) {
      return NextResponse.json({ error: intError.message }, { status: 500 });
    }

    const today = new Date().toISOString().split("T")[0];
    const syncResults: {
      platform: string;
      imported: number;
      error?: string;
    }[] = [];

    for (const integration of integrations ?? []) {
      const { platform, external_ical_url } = integration as { platform: string; external_ical_url: string | null };
      try {
        const icalRes = await fetch(external_ical_url || "", {
          headers: { "User-Agent": "Nodebase-CalendarSync/1.0" },
        });
        if (!icalRes.ok)
          throw new Error(
            `HTTP ${icalRes.status} fetching iCal for ${platform}`,
          );

        const icalText = await icalRes.text();
        const { parseICal } = await import("@/lib/ical");
        const events = parseICal(icalText);

        // Delete existing future bookings for this platform before re-inserting
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
          // Get or create a placeholder guest for this external platform
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

        await supabase
          .from("listing_integrations")
          .update({
            status: "connected",
            last_synced_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("listing_id", listingId)
          .eq("platform", platform);

        syncResults.push({ platform, imported: validEvents.length });
      } catch (err: any) {
        console.error(`[CalendarSync] Failed for ${platform}:`, err);
        await supabase
          .from("listing_integrations")
          .update({
            status: "error",
            last_synced_at: new Date().toISOString(),
            error_message: err.message,
          })
          .eq("listing_id", listingId)
          .eq("platform", platform);
        syncResults.push({ platform, imported: 0, error: err.message });
      }
    }

    // Deduct Credits
    await WalletService.deductCredits(
      tenantId,
      estimatedCost,
      "calendar_sync",
      {
        listing_id: listingId,
        type: "manual_sync",
        results: syncResults,
      },
    );

    // Log Event
    await logEvent({
      tenant_id: tenantId,
      actor_type: "user",
      event_type: EVENT_TYPES.SYSTEM_CALENDAR_SYNC,
      entity_type: "listing",
      entity_id: listingId,
      metadata: { type: "manual", cost: estimatedCost, results: syncResults },
    });

    const syncedCount = syncResults.filter((r) => !r.error).length;
    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      synced: syncedCount,
      failed: syncResults.length - syncedCount,
      results: syncResults,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Sync failed" },
      { status: 500 },
    );
  }
}
