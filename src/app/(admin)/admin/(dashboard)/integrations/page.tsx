import { getSupabaseServer } from "@/lib/supabase/server";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

type ProviderHealth = {
  provider: string;
  connectedAccounts: number;
  errorRate: number;
  lastFailure: string | null;
  expiredCount: number;
  lastSync: string | null;
};

// Server Component
export default async function AdminIntegrationsHealthPage() {
  const supabase = await getSupabaseServer();
  
  // Fetch raw data
  const { data: integrations, error } = await supabase
    .from("listing_integrations")
    .select("platform, status, last_synced_at, updated_at");

  if (error) {
      return <div className="p-8 text-red-400">Error loading integrations: {error.message}</div>;
  }

  // Aggregate stats by provider
  const stats = (integrations || []).reduce((acc: Record<string, ProviderHealth>, curr: any) => {
      const provider = curr.platform || 'unknown';
      if (!acc[provider]) {
          acc[provider] = {
              provider,
              connectedAccounts: 0,
              errorRate: 0,
              lastFailure: null,
              expiredCount: 0,
              lastSync: null
          };
      }
      
      const p = acc[provider];
      p.connectedAccounts++;
      if (curr.status === 'error') {
          // Calculate rudimentary error rate later
          p.errorRate++; // Temporarily store count
          if (!p.lastFailure || new Date(curr.updated_at) > new Date(p.lastFailure)) {
              p.lastFailure = curr.updated_at;
          }
      }
      if (curr.status === 'expired') {
          p.expiredCount++;
      }
      if (curr.last_synced_at && (!p.lastSync || new Date(curr.last_synced_at) > new Date(p.lastSync))) {
          p.lastSync = curr.last_synced_at;
      }
      
      return acc;
  }, {});

  // Finalize stats
  const providers = Object.values(stats).map(p => ({
      ...p,
      errorRate: p.connectedAccounts > 0 ? Math.round((p.errorRate / p.connectedAccounts) * 100) : 0
  }));

  const failedCount = providers.filter(p => p.errorRate > 10).length;
  // Webhook failures requires audit logs join, skipping for now or fetching separately
  
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations Health</h1>
        <p className="text-zinc-400">Monitor provider stability and sync reliability.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-500">Providers Failing</div>
          <div className="mt-2 text-white text-xl font-semibold">{failedCount}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-500">Active Connections</div>
          <div className="mt-2 text-white text-xl font-semibold">{integrations?.length || 0}</div>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-lg overflow-auto bg-zinc-950/60">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
            <tr>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Total Accounts</th>
              <th className="px-4 py-3">Error Rate</th>
              <th className="px-4 py-3">Expired Tokens</th>
              <th className="px-4 py-3">Last Sync</th>
              <th className="px-4 py-3">Last Failure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {providers.map((provider) => (
              <tr key={provider.provider} className="hover:bg-zinc-900/40">
                <td className="px-4 py-3 text-white">{provider.provider}</td>
                <td className="px-4 py-3">{provider.connectedAccounts}</td>
                <td className="px-4 py-3">
                    <span className={provider.errorRate > 10 ? "text-red-400 font-bold" : "text-zinc-400"}>
                        {provider.errorRate}%
                    </span>
                </td>
                <td className="px-4 py-3">{provider.expiredCount}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {provider.lastSync ? new Date(provider.lastSync).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {provider.lastFailure ? new Date(provider.lastFailure).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
            {providers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                  No integration data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
