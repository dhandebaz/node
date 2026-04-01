import { getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { googleBusinessService } from "./googleBusinessService";
import { metaService } from "./metaService";
import { decryptToken, encryptToken } from "@/lib/crypto";
import { ControlService } from "./controlService";

export class SyncService {
  /**
   * Main entry point to sync all active integrations across all tenants.
   * Designed to be called by a cron job or background trigger.
   */
  static async syncAllActive() {
    log.info("[SyncService] Starting global synchronization for all active integrations");

    const admin = await getSupabaseAdmin();

    // 1. Check Global Kill Switch
    try {
      await ControlService.checkAction(null, "sync");
    } catch (e) {
      log.warn("[SyncService] Synchronization is globally disabled via ControlService");
      return;
    }

    // 2. Fetch all 'active' integrations
    const { data: integrations, error } = await admin
      .from("integrations")
      .select("*")
      .eq("status", "active");

    if (error) {
      log.error("[SyncService] Failed to fetch active integrations", { error });
      return;
    }

    log.info(`[SyncService] Found ${integrations.length} active integration(s) to process`);

    const results = await Promise.allSettled(
      integrations.map(async (integration) => {
        try {
          await this.processIntegration(integration);
        } catch (e) {
          log.error(`[SyncService] Failed to sync integration ${integration.id} (${integration.provider})`, { error: e });
          
          // Update status to 'error' if it's a structural failure
          await admin
            .from("integrations")
            .update({ 
               status: "error", 
               error_code: (e as any).message || "SYNC_FAILED",
               last_synced_at: new Date().toISOString() 
            })
            .eq("id", integration.id);
        }
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    log.info(`[SyncService] Global sync completed. Success: ${succeeded}, Failed: ${failed}`);
  }

  /**
   * Processes a single integration: handles token refresh and provider-specific sync tasks.
   */
  static async processIntegration(integration: any) {
    const admin = await getSupabaseAdmin();
    const { id, provider, tenant_id, refresh_token, expires_at } = integration;

    log.info(`[SyncService] Processing integration ${id} (${provider}) for tenant ${tenant_id}`);

    // 1. Token Refresh Check
    let currentAccessToken = decryptToken(integration.access_token);
    
    const isAboutToExpire = expires_at && new Date(expires_at).getTime() < (Date.now() + 5 * 60 * 1000); // 5 mins buffer
    
    if (isAboutToExpire && refresh_token) {
      log.info(`[SyncService] Token for ${id} is expiring, refreshing...`);
      const decryptedRefresh = decryptToken(refresh_token);
      
      let refreshResult: { success: boolean; tokens?: any; error?: string } = { success: false };

      if (provider === "google-business" || provider === "google") {
        refreshResult = await googleBusinessService.refreshAccessToken(decryptedRefresh);
      }

      if (refreshResult.success && refreshResult.tokens) {
        currentAccessToken = refreshResult.tokens.access_token;
        const newExpiresAt = new Date(Date.now() + refreshResult.tokens.expires_in * 1000).toISOString();
        
        await admin
          .from("integrations")
          .update({
            access_token: encryptToken(currentAccessToken),
            expires_at: newExpiresAt,
            status: "active"
          })
          .eq("id", id);
          
        log.info(`[SyncService] Token refreshed successfully for ${id}`);
      } else {
        log.error(`[SyncService] Token refresh failed for ${id}`, { error: refreshResult.error });
        throw new Error(refreshResult.error || "TOKEN_REFRESH_FAILED");
      }
    }

    // 2. Provider-Specific Sync Tasks
    // This is where we trigger actual data pulling (fetching missing messages, etc.)
    switch (provider) {
      case "google-business":
        // Ensure webhooks are still healthy
        await googleBusinessService.registerWebhook({
          accessToken: currentAccessToken,
          refreshToken: decryptToken(refresh_token || ""),
          businessAccountId: (integration.settings as any)?.business_account_id || "",
          locationId: (integration.settings as any)?.location_id || "",
          projectId: (integration.settings as any)?.project_id || ""
        });
        break;

      case "meta":
      case "instagram":
      case "whatsapp":
      case "threads":
        // For Meta, we might want to check the subscription status
        const settings = integration.settings as any;
        if (settings?.page_id) {
           await metaService.subscribeToPage(settings.page_id, currentAccessToken);
        }

        // --- NEW: Health checks for Meta Expansion capabilities ---
        
        // 1. Marketing (Ads/Leads)
        if (settings?.ad_account_id) {
          const { MetaMarketingService } = await import("./metaMarketingService");
          const adsHealth = await MetaMarketingService.getAdAccount(settings.ad_account_id, currentAccessToken);
          if (!adsHealth.success) log.warn(`[SyncService] Ad Account ${settings.ad_account_id} health check failed`, { error: adsHealth.error });
        }

        // 2. Content Publishing (Instagram Stories/Reels)
        if (settings?.ig_user_id) {
          const { MetaPublishingService } = await import("./metaPublishingService");
          // Check if IG account is still reachable
          const igHealth = await MetaPublishingService.getMedia(settings.ig_user_id, currentAccessToken);
          if (!igHealth.success) log.warn(`[SyncService] IG Publishing for ${settings.ig_user_id} health check failed`, { error: igHealth.error });
        }

        // 3. Threads
        if (provider === "threads" || settings?.threads_user_id) {
          const { ThreadsService } = await import("./threadsService");
          const threadsHealth = await ThreadsService.getUserProfile(currentAccessToken);
          if (!threadsHealth.success) log.warn(`[SyncService] Threads health check failed`, { error: threadsHealth.error });
        }

        // 4. Catalogs
        if (settings?.catalog_id) {
          const { MetaCatalogService } = await import("./metaCatalogService");
          const catalogHealth = await MetaCatalogService.getCatalogs(settings.business_id || "", currentAccessToken);
          if (!catalogHealth.success) log.warn(`[SyncService] Catalog health check failed`, { error: catalogHealth.error });
        }
        break;
      
      default:
        log.warn(`[SyncService] No provider-specific sync logic for ${provider}`);
    }

    // 3. Mark as Synced
    await admin
      .from("integrations")
      .update({ 
        last_synced_at: new Date().toISOString(),
        status: "active",
        error_code: null
      })
      .eq("id", id);
  }
}
