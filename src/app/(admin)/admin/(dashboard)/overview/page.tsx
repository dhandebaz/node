"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Users, Cpu, MessageSquare, Gauge, Wallet, Plug } from "lucide-react";
import Link from "next/link";

type OverviewData = {
  customers: {
    activeCount: number;
    walletBalanceTotal: number;
  };
  managers: {
    activeCount: number;
  };
  usage: {
    messagesToday: number;
    tokensToday: number;
  };
  integrations: {
    failedCount: number;
  };
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Request failed");
  }
  return response.json();
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchJson<any>("/api/admin/customers"),
      fetchJson<any>("/api/admin/ai-managers"),
      fetchJson<any>("/api/admin/usage"),
      fetchJson<any>("/api/admin/integrations/health")
    ])
      .then(([customersPayload, managersPayload, usagePayload, integrationsPayload]) => {
        const activeCustomers = (customersPayload?.customers || []).filter((customer: any) => customer.status === "active");
        const walletBalanceTotal = (customersPayload?.customers || []).reduce(
          (sum: number, customer: any) => sum + (Number(customer.walletBalance) || 0),
          0
        );
        const activeManagers = (managersPayload?.managers || []).filter((manager: any) => manager.status === "active");
        const overview: OverviewData = {
          customers: {
            activeCount: activeCustomers.length,
            walletBalanceTotal
          },
          managers: {
            activeCount: activeManagers.length
          },
          usage: {
            messagesToday: usagePayload?.summary?.messagesToday || 0,
            tokensToday: usagePayload?.summary?.tokensToday || 0
          },
          integrations: {
            failedCount: integrationsPayload?.summary?.failedCount || 0
          }
        };
        setData(overview);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const formattedWallet = useMemo(() => {
    const value = data?.customers.walletBalanceTotal || 0;
    return new Intl.NumberFormat("en-IN").format(value);
  }, [data?.customers.walletBalanceTotal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-300">
        {error || "Unable to load admin overview."}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-zinc-400">System-wide status and cost signals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Active Customers" value={data.customers.activeCount} icon={Users} />
        <StatCard title="Active AI Managers" value={data.managers.activeCount} icon={Cpu} />
        <StatCard title="AI Messages Today" value={data.usage.messagesToday} icon={MessageSquare} />
        <StatCard title="Token Usage Today" value={data.usage.tokensToday} icon={Gauge} />
        <StatCard title="Wallet Balance" value={`₹${formattedWallet}`} icon={Wallet} />
        <StatCard title="Failed Integrations" value={data.integrations.failedCount} icon={Plug} alert />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Live Ops Pointers</h2>
            <Link href="/admin/ai-managers" className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white">
              Manage AI Managers
            </Link>
          </div>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span>Pricing overrides and availability</span>
              <span className="text-zinc-200">{data.managers.activeCount} active</span>
            </li>
            <li className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span>Customer balances at risk</span>
              <span className="text-zinc-200">₹{formattedWallet}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Integration incidents today</span>
              <span className="text-zinc-200">{data.integrations.failedCount}</span>
            </li>
          </ul>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">System Health</h2>
            <Link href="/admin/logs" className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white">
              Review Logs
            </Link>
          </div>
          <div className="space-y-4 text-sm text-zinc-400">
            <HealthRow label="AI output throughput" value={`${data.usage.messagesToday} messages`} />
            <HealthRow label="Token burn rate" value={`${data.usage.tokensToday} tokens`} />
            <HealthRow label="Failed integrations" value={`${data.integrations.failedCount} providers`} />
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
