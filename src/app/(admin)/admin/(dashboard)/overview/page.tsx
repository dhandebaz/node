import { getSupabaseServer } from "@/lib/supabase/server";
import { Loader2, Users, Cpu, MessageSquare, Gauge, Wallet, Plug } from "lucide-react";
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
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-zinc-400">System-wide status and cost signals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Active Customers" value={activeCustomersCount || 0} icon={Users} />
        <StatCard title="Total Tenants" value={activeManagersCount || 0} icon={Cpu} />
        <StatCard title="AI Messages Today" value={messagesToday || 0} icon={MessageSquare} />
        <StatCard title="Token Usage Today" value={tokensToday} icon={Gauge} />
        <StatCard title="Wallet Balance" value={`₹${formattedWallet}`} icon={Wallet} />
        <StatCard title="Failed Integrations" value={failedIntegrationsCount} icon={Plug} alert={failedIntegrationsCount > 0} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Live Ops Pointers</h2>
            <Link href="/admin/pricing" className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white">
              Manage Pricing
            </Link>
          </div>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span>Active Subscriptions</span>
              <span className="text-zinc-200">{activeCustomersCount} active</span>
            </li>
            <li className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span>Customer balances held</span>
              <span className="text-zinc-200">₹{formattedWallet}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Integration incidents today</span>
              <span className="text-zinc-200">{failedIntegrationsCount}</span>
            </li>
          </ul>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">System Health</h2>
            <Link href="/admin/audit" className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white">
              Review Logs
            </Link>
          </div>
          <div className="space-y-4 text-sm text-zinc-400">
            <HealthRow label="AI output throughput" value={`${messagesToday || 0} messages`} />
            <HealthRow label="Token burn rate" value={`${tokensToday} tokens`} />
            <HealthRow label="Failed integrations" value={`${failedIntegrationsCount} providers`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, alert }: { title: string; value: string | number; icon: any; alert?: boolean }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-400 text-xs uppercase tracking-widest">{title}</span>
        <Icon className={`w-4 h-4 ${alert ? "text-red-400" : "text-zinc-500"}`} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-b-0 last:pb-0">
      <span>{label}</span>
      <span className="text-zinc-200">{value}</span>
    </div>
  );
}
