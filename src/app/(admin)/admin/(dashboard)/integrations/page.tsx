import { getSupabaseServer } from "@/lib/supabase/server";
import { Activity, Server, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Neural <span className="text-primary/40">Sync</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Provider stability & architectural sync monitoring
          </p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 px-6 py-4 rounded-2xl border border-border shadow-inner">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Registry Synchronized</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm transition-all hover:shadow-md hover:border-destructive/20 group">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Providers Failing</span>
            <AlertTriangle className="h-4 w-4 text-destructive/40 group-hover:text-destructive transition-colors" />
          </div>
          <div className="text-4xl font-black text-foreground tracking-tighter mb-2">{failedCount}</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Immediate attention required</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Active Connections</span>
            <Zap className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-4xl font-black text-foreground tracking-tighter mb-2">{integrations?.length || 0}</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Total verified provider links</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm group">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black tracking-[0.3em] border-b border-border">
              <tr>
                <th className="px-8 py-6">Provider_Node</th>
                <th className="px-8 py-6">Link_Volume</th>
                <th className="px-8 py-6">Failure_Probability</th>
                <th className="px-8 py-6">Expired_Links</th>
                <th className="px-8 py-6">Last_Registry_Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {providers.map((provider) => (
                <tr key={provider.provider} className="hover:bg-muted/30 transition-all group/row border-b border-border/50 last:border-0 border-dashed">
                  <td className="px-8 py-6">
                    <div className="text-foreground font-black uppercase tracking-widest text-[10px] group-hover/row:text-primary transition-colors">
                      {provider.provider}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono text-[10px] font-bold text-muted-foreground/60">{provider.connectedAccounts}</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all",
                      provider.errorRate > 10 
                        ? "bg-destructive/10 text-destructive border-destructive/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]" 
                        : "bg-success/10 text-success border-success/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                    )}>
                        {provider.errorRate}%
                    </span>
                  </td>
                  <td className="px-8 py-6 font-mono text-[10px] font-bold text-muted-foreground/60">{provider.expiredCount}</td>
                  <td className="px-8 py-6 text-muted-foreground/30 font-mono text-[9px] italic">
                    {provider.lastSync ? new Date(provider.lastSync).toLocaleString() : "NEVER_SYNCED"}
                  </td>
                </tr>
              ))}
              {providers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-zinc-500">
                    No integration data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
