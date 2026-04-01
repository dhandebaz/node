import { getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { parseICal } from "@/lib/ical";

export class ListingSyncService {
  /**
   * Sync all external calendars for all listings.
   */
  static async syncAll() {
    log.info("[ListingSyncService] Starting global listing calendar sync");
    const admin = await getSupabaseAdmin();

    const { data: integrations, error } = await admin
      .from("listing_integrations")
      .select("*, listings(tenant_id)")
      .not("external_ical_url", "is", null);

    if (error) {
      log.error("[ListingSyncService] Failed to fetch listing integrations", { error });
      return;
    }

    log.info(`[ListingSyncService] Found ${integrations.length} calendar(s) to sync`);

    for (const integration of integrations) {
      if (!integration.listing_id) {
        log.warn("[ListingSyncService] Found integration without listing_id", { id: integration.id });
        continue;
      }
      try {
        await this.syncListing(integration.listing_id, integration);
      } catch (e) {
        log.error(`[ListingSyncService] Failed to sync listing ${integration.listing_id}`, { error: e });
      }
    }
  }

  /**
   * Sync a specific listing's external calendar.
   * @param force Explicitly bypass the 30-minute cooldown
   */
  static async syncListing(listingId: string, integration: any, force: boolean = false) {
    const { id, external_ical_url, platform, last_synced_at } = integration;
    if (!external_ical_url) return;

    // --- Optimization: 30-minute cooldown ---
    const MIN_SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();
    const lastSync = last_synced_at ? new Date(last_synced_at).getTime() : 0;
    
    if (!force && lastSync > (now - MIN_SYNC_INTERVAL)) {
      log.info(`[ListingSyncService] Skipping listing ${listingId} (${platform}) - synced recently (${Math.round((now - lastSync) / 60000)}m ago)`);
      return;
    }

    log.info(`[ListingSyncService] Syncing ${platform} calendar for listing ${listingId}`);

    // 1. Fetch iCal Data
    const response = await fetch(external_ical_url);
    if (!response.ok) {
      throw new Error(`Failed to fetch iCal: ${response.statusText}`);
    }
    const icalData = await response.text();

    // 2. Parse iCal Data
    const events = parseICal(icalData);
    log.info(`[ListingSyncService] Parsed ${events.length} events from ${platform}`);

    const admin = await getSupabaseAdmin();
    const tenantId = integration.listings?.tenant_id;

    // 3. Upsert into Bookings
    // We use the iCal UID as a unique identifier in metadata to avoid duplicates
    for (const event of events) {
      const { uid, startDate, endDate, summary } = event;

      // Skip past events (optional, but good for performance)
      if (endDate < new Date()) continue;

      const { error: upsertError } = await admin
        .from("bookings")
        .upsert({
          listing_id: listingId,
          tenant_id: tenantId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          source: platform.toLowerCase(),
          status: "confirmed",
          metadata: {
            ical_uid: uid,
            summary: summary,
            synced_at: new Date().toISOString()
          }
        }, {
          onConflict: "metadata->>ical_uid" // Note: This requires a unique index on the metadata field in Postgres
        });

      if (upsertError) {
        log.error(`[ListingSyncService] Failed to upsert booking for event ${uid}`, { error: upsertError });
      }
    }

    // 4. Update sync timestamp on integration
    await admin
      .from("listing_integrations")
      .update({ 
        last_synced_at: new Date().toISOString(),
        status: "connected"
      })
      .eq("id", integration.id);
  }
}
