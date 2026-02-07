import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const now = new Date();

    const [{ data: integrations, error: integrationsError }, { data: logs, error: logsError }] = await Promise.all([
      supabase
        .from("integrations")
        .select("provider, status, last_sync, expires_at, error_code"),
      supabase
        .from("system_logs")
        .select("service, severity, message, timestamp")
        .gte("timestamp", since.toISOString())
    ]);

    if (integrationsError || logsError) {
      return NextResponse.json({ error: integrationsError?.message || logsError?.message }, { status: 500 });
    }

    const providerBuckets = new Map<string, { total: number; errors: number; expired: number; lastFailure: string | null; lastSync: string | null }>();
    (integrations || []).forEach((integration: any) => {
      const key = integration.provider || "unknown";
      if (!providerBuckets.has(key)) {
        providerBuckets.set(key, { total: 0, errors: 0, expired: 0, lastFailure: null, lastSync: null });
      }
      const bucket = providerBuckets.get(key)!;
      bucket.total += 1;
      if (integration.status === "error") {
        bucket.errors += 1;
      }
      if (integration.expires_at && new Date(integration.expires_at) < now) {
        bucket.expired += 1;
      }
      if (integration.last_sync) {
        if (!bucket.lastSync || new Date(integration.last_sync) > new Date(bucket.lastSync)) {
          bucket.lastSync = integration.last_sync;
        }
      }
    });

    const webhookFailures = (logs || []).filter((log: any) =>
      String(log.message || "").toLowerCase().includes("webhook") &&
      String(log.service || "").toLowerCase().includes("integration")
    );

    const providers = Array.from(providerBuckets.entries()).map(([provider, data]) => ({
      provider,
      connectedAccounts: data.total,
      errorRate: data.total === 0 ? 0 : Math.round((data.errors / data.total) * 100),
      lastFailure: data.lastFailure,
      expiredCount: data.expired,
      lastSync: data.lastSync
    }));

    const failedCount = providers.reduce((sum, provider) => sum + (provider.errorRate > 0 ? 1 : 0), 0);

    return NextResponse.json({
      summary: {
        failedCount,
        webhookFailures: webhookFailures.length
      },
      providers
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load integrations health" }, { status: 500 });
  }
}
