"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type ProviderHealth = {
  provider: string;
  connectedAccounts: number;
  errorRate: number;
  lastFailure: string | null;
  expiredCount: number;
  lastSync: string | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Request failed");
  }
  return response.json();
}

export default function AdminIntegrationsHealthPage() {
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [summary, setSummary] = useState<{ failedCount: number; webhookFailures: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchJson<any>("/api/admin/integrations/health")
      .then((payload) => {
        setProviders(payload.providers || []);
        setSummary(payload.summary || null);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations Health</h1>
        <p className="text-zinc-400">Monitor provider stability and sync reliability.</p>
      </div>

      {summary && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500">Providers Failing</div>
            <div className="mt-2 text-white text-xl font-semibold">{summary.failedCount}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500">Webhook Failures (7d)</div>
            <div className="mt-2 text-white text-xl font-semibold">{summary.webhookFailures}</div>
          </div>
        </div>
      )}

      <div className="border border-zinc-800 rounded-lg overflow-auto bg-zinc-950/60">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
            <tr>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Connected Accounts</th>
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
                <td className="px-4 py-3">{provider.errorRate}%</td>
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
                  No integration health data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
