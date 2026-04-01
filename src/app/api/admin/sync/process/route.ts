import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { SyncService } from "@/lib/services/syncService";
import { ListingSyncService } from "@/lib/services/listingSyncService";

/**
 * API route to trigger integration and calendar synchronization.
 * Securely protected by a CRON_SECRET header to prevent unauthorized access.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  // 1. Basic security check
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    log.warn("[SyncAPI] Unauthorized sync attempt blocked");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If in development and no secret set, allow local testing
  if (!cronSecret && process.env.NODE_ENV !== "development") {
    log.error("[SyncAPI] CRON_SECRET not configured in production");
    return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
  }

  log.info("[SyncAPI] Starting background sync process...");

  try {
    // 2. Perform synchronization tasks
    // Using Promise.allSettled to ensure failure in one doesn't block the other
    const results = await Promise.allSettled([
      SyncService.syncAllActive(),
      ListingSyncService.syncAll()
    ]);

    const successes = results.filter(r => r.status === "fulfilled").length;
    const failures = results.filter(r => r.status === "rejected").length;

    log.info(`[SyncAPI] background sync process completed. Succeeded: ${successes}, Failed: ${failures}`);

    return NextResponse.json({
      success: true,
      message: "Sync process completed",
      details: { successes, failures }
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    log.error("[SyncAPI] Sync process failed", { error: errorMsg });
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
