import { getSupabaseServer } from "@/lib/supabase/server";
import { Loader2, Users, Cpu, MessageSquare, Gauge, Wallet, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const supabase = await getSupabaseServer();

  // Parallel Data Fetching
  const [
    { count: activeCustomersCount },
    { data: wallets },
    { count: activeManagersCount }, // Assuming managers are tenants with specific config or just count all tenants for now
    { count: messagesToday },
    { data: usageEvents },
    { data: integrations }
  ] = await Promise.all([
    supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabase.from('wallets').select('balance'),
    supabase.from('tenants').select('*', { count: 'exact', head: true }), // Total tenants as proxy for active managers deployed
    supabase.from('messages').select('*', { count: 'exact', head: true }).gte('timestamp', new Date().toISOString().split('T')[0]),
    supabase.from('ai_usage_events').select('tokens_used').gte('created_at', new Date().toISOString().split('T')[0]),
    supabase.from('listing_integrations').select('status')
  ]);

  const walletBalanceTotal = (wallets || []).reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
  const tokensToday = (usageEvents || []).reduce((sum, e) => sum + (e.tokens_used || 0), 0);
  const failedIntegrationsCount = (integrations || []).filter(i => i.status === 'error').length;

  const formattedWallet = new Intl.NumberFormat("en-IN").format(walletBalanceTotal);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Neural <span className="text-primary/40">Overview</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Real-time system health & economic throughput
          </p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 px-6 py-4 rounded-2xl border border-border shadow-inner">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Live Feed Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
        <StatCard title="Active Customers" value={activeCustomersCount || 0} icon={Users} description="Verified business units" />
        <StatCard title="Total Tenants" value={activeManagersCount || 0} icon={Cpu} description="Neural clusters deployed" />
        <StatCard title="AI Messages" value={messagesToday || 0} icon={MessageSquare} description="24h architectural throughput" />
        <StatCard title="Token Burn" value={tokensToday.toLocaleString()} icon={Gauge} description="Today's computational cost" />
        <StatCard title="Liquidity" value={`₹${formattedWallet}`} icon={Wallet} description="Total aggregate balances" />
        <StatCard title="Incident Alerts" value={failedIntegrationsCount} icon={Plug} alert={failedIntegrationsCount > 0} description="Platform sync stability" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm group">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">Core Economic Signals</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Strategic platform metrics</p>
            </div>
            <Link href="/admin/pricing" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all border-b border-primary/20 hover:border-primary pb-1">
              Manage_Pricing →
            </Link>
          </div>
          <div className="space-y-6">
            <HealthRow label="Verified Subscriptions" value={`${activeCustomersCount} ACTIVE_NODES`} />
            <HealthRow label="Aggregate Liquidity" value={`₹${formattedWallet}`} />
            <HealthRow label="Sync Incidents" value={`${failedIntegrationsCount}`} alert={failedIntegrationsCount > 0} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm group">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">Infrastructure Health</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Neural network performance</p>
            </div>
            <Link href="/admin/audit" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all border-b border-primary/20 hover:border-primary pb-1">
              Review_Forensics →
            </Link>
          </div>
          <div className="space-y-6">
            <HealthRow label="Message Throughput" value={`${messagesToday || 0} MESSAGES`} />
            <HealthRow label="Neural Burn Rate" value={`${tokensToday} TOKENS`} />
            <HealthRow label="Registry Status" value={`${failedIntegrationsCount === 0 ? "STABLE" : "DEGRADED"}`} alert={failedIntegrationsCount > 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  alert, 
  description,
  trend // No longer default to a mock array
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  alert?: boolean;
  description?: string;
  trend?: number[];
}) {
  return (
    <div className={cn(
      "glass-panel rounded-2xl p-6 min-h-[160px] flex flex-col justify-between group transition-all duration-500 hover:scale-[1.02]",
      alert ? "border-destructive/30 shadow-destructive/10" : "border-white/5"
    )}>
      <div className="flex justify-between items-start">
        <div className={cn(
          "p-3 rounded-xl border border-white/10",
          alert ? "text-destructive" : "text-primary/60 group-hover:text-primary"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        
        {/* Simple SVG Sparkline */}
        {!alert && trend && (
          <svg className="w-16 h-8 opacity-20 group-hover:opacity-40 transition-opacity" viewBox="0 0 100 40">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={trend.map((v, i) => `${(i * 100) / (trend.length - 1)},${40 - (v / 100) * 40}`).join(' ')}
              className="text-primary"
            />
          </svg>
        )}
        
        {alert && <div className="w-2 h-2 rounded-full bg-destructive animate-ping mt-2 mr-2" />}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-black tracking-tighter text-foreground mb-0.5 font-mono">
          {value}
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </div>
        {description && (
          <p className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/30 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function HealthRow({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-5 last:border-0 last:pb-0 border-dashed">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</span>
      <span className={cn(
        "text-[11px] font-black uppercase tracking-tighter px-3 py-1 rounded-md border",
        alert 
          ? "bg-destructive/10 text-destructive border-destructive/20" 
          : "bg-muted/50 text-foreground border-border"
      )}>{value}</span>
    </div>
  );
}
