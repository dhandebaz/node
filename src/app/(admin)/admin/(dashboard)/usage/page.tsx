"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

type UsagePayload = {
  summary: { tokensToday: number; messagesToday: number };
  byDay: Array<{ date: string; tokens: number; messages: number }>;
  byManager: Array<{ managerSlug: string; tokens: number; messages: number }>;
  walletTransactions: Array<{ id: string; host_id: string; type: string; amount: number; reason: string; status: string; timestamp: string }>;
  topUps: Array<{ id: string; host_id: string; type: string; amount: number; reason: string; status: string; timestamp: string }>;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Request failed");
  }
  return response.json();
}

export default function AdminUsagePage() {
  const [data, setData] = useState<UsagePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [managerFilter, setManagerFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchJson<UsagePayload>("/api/admin/usage")
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredByDay = useMemo(() => {
    if (!data) return [];
    return data.byDay.filter((entry) => {
      if (dateFrom && entry.date < dateFrom) return false;
      if (dateTo && entry.date > dateTo) return false;
      return true;
    });
  }, [data, dateFrom, dateTo]);

  const filteredByManager = useMemo(() => {
    if (!data) return [];
    if (managerFilter === "all") return data.byManager;
    return data.byManager.filter((entry) => entry.managerSlug === managerFilter);
  }, [data, managerFilter]);

  const filteredTransactions = useMemo(() => {
    if (!data) return [];
    return data.walletTransactions.filter((tx) => {
      const txDate = tx.timestamp.slice(0, 10);
      if (dateFrom && txDate < dateFrom) return false;
      if (dateTo && txDate > dateTo) return false;
      if (customerFilter && !tx.host_id.includes(customerFilter)) return false;
      return true;
    });
  }, [data, dateFrom, dateTo, customerFilter]);

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
        {error || "Unable to load usage data."}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Usage & Wallets</h1>
        <p className="text-zinc-400">Token usage, wallet debits/credits, and top-ups.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-500">Tokens Today</div>
          <div className="mt-2 text-white text-xl font-semibold">{new Intl.NumberFormat("en-IN").format(data.summary.tokensToday)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-500">Messages Today</div>
          <div className="mt-2 text-white text-xl font-semibold">{new Intl.NumberFormat("en-IN").format(data.summary.messagesToday)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-500">Wallet Debits/Credits</div>
          <div className="mt-2 text-white text-xl font-semibold">{new Intl.NumberFormat("en-IN").format(data.walletTransactions.length)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-500">Top-ups</div>
          <div className="mt-2 text-white text-xl font-semibold">{new Intl.NumberFormat("en-IN").format(data.topUps.length)}</div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          Date From
          <input
            type="date"
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </label>
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          Date To
          <input
            type="date"
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </label>
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          AI Manager
          <select
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
          >
            <option value="all">All</option>
            {data.byManager.map((entry) => (
              <option key={entry.managerSlug} value={entry.managerSlug}>
                {entry.managerSlug}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          Customer
          <input
            type="text"
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            placeholder="Customer ID"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 overflow-auto">
          <h2 className="text-sm font-semibold text-white mb-4">Token Usage by Day</h2>
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Tokens</th>
                <th className="px-4 py-3">Messages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredByDay.map((entry) => (
                <tr key={entry.date}>
                  <td className="px-4 py-3">{entry.date}</td>
                  <td className="px-4 py-3">{new Intl.NumberFormat("en-IN").format(entry.tokens)}</td>
                  <td className="px-4 py-3">{new Intl.NumberFormat("en-IN").format(entry.messages)}</td>
                </tr>
              ))}
              {filteredByDay.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
                    No usage records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 overflow-auto">
          <h2 className="text-sm font-semibold text-white mb-4">Token Usage by AI Manager</h2>
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-4 py-3">AI Manager</th>
                <th className="px-4 py-3">Tokens</th>
                <th className="px-4 py-3">Messages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredByManager.map((entry) => (
                <tr key={entry.managerSlug}>
                  <td className="px-4 py-3 text-white">{entry.managerSlug}</td>
                  <td className="px-4 py-3">{new Intl.NumberFormat("en-IN").format(entry.tokens)}</td>
                  <td className="px-4 py-3">{new Intl.NumberFormat("en-IN").format(entry.messages)}</td>
                </tr>
              ))}
              {filteredByManager.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
                    No usage records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 overflow-auto">
        <h2 className="text-sm font-semibold text-white mb-4">Wallet Debits & Credits</h2>
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-4 py-3 text-zinc-400">{tx.host_id}</td>
                <td className="px-4 py-3">{tx.type}</td>
                <td className="px-4 py-3">₹{new Intl.NumberFormat("en-IN").format(tx.amount || 0)}</td>
                <td className="px-4 py-3 text-zinc-400">{tx.reason || "—"}</td>
                <td className="px-4 py-3">{tx.status}</td>
                <td className="px-4 py-3 text-zinc-500">{new Date(tx.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  No wallet activity found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
