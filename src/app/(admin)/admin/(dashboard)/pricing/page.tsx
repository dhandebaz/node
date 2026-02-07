"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type PricingConfig = {
  tokenCostPer1k: number;
  nodeInfraMarginPct: number;
  coreLogicMarginPct: number;
};

type PricingManager = {
  slug: string;
  name: string;
  status: "active" | "disabled";
  baseMonthlyPrice: number;
  updatedAt: string | null;
};

type ManagerEstimate = {
  slug: string;
  estimatedMonthlyTokenCost: number;
  estimatedMonthlyInfraCost: number;
  estimatedMonthlyTotalCost: number;
  suggestedMinimumPrice: number;
  inputs: {
    avgMessagesPerDay: number;
    avgTokensPerMessage: number;
    calendarSyncMonthlyCost: number;
    integrationApiMonthlyCost: number;
    updatedAt: string | null;
  };
};

type PricingHistory = {
  manager_slug: string;
  old_price: number;
  new_price: number;
  changed_by: string | null;
  timestamp: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Request failed");
  }
  return response.json();
}

export default function AdminPricingPage() {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [managers, setManagers] = useState<PricingManager[]>([]);
  const [estimates, setEstimates] = useState<ManagerEstimate[]>([]);
  const [history, setHistory] = useState<PricingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);

  const loadPricing = () => {
    setLoading(true);
    fetchJson<any>("/api/admin/pricing/estimate")
      .then((payload) => {
        setConfig(payload.config);
        setManagers(payload.managers || []);
        setEstimates(payload.estimates || []);
        setHistory(payload.pricingHistory || []);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPricing();
  }, []);

  const saveConfig = async () => {
    if (!config) return;
    setSavingConfig(true);
    try {
      const response = await fetch("/api/admin/pricing/config/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to save");
      }
      loadPricing();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSavingConfig(false);
    }
  };

  const saveInputs = async (slug: string, inputs: ManagerEstimate["inputs"]) => {
    setSavingSlug(slug);
    try {
      const response = await fetch("/api/admin/pricing/inputs/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerSlug: slug,
          avgMessagesPerDay: inputs.avgMessagesPerDay,
          avgTokensPerMessage: inputs.avgTokensPerMessage,
          calendarSyncMonthlyCost: inputs.calendarSyncMonthlyCost,
          integrationApiMonthlyCost: inputs.integrationApiMonthlyCost
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to save");
      }
      loadPricing();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSavingSlug(null);
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat("en-IN").format(value);

  const estimateBySlug = useMemo(() => new Map(estimates.map((item) => [item.slug, item])), [estimates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-300">
        {error || "Unable to load pricing data."}
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pricing & Cost Intelligence</h1>
          <p className="text-zinc-400">Live cost inputs, estimates, and price audit trail.</p>
        </div>
        <Link href="/pricing" className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white">
          View Public Pricing
        </Link>
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Cost Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="text-xs uppercase tracking-widest text-zinc-500">
            Token Model Cost (₹ per 1K tokens)
            <input
              type="number"
              className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
              value={config.tokenCostPer1k}
              onChange={(e) => setConfig({ ...config, tokenCostPer1k: Number(e.target.value) })}
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-zinc-500">
            Node Infra Margin (%)
            <input
              type="number"
              className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
              value={config.nodeInfraMarginPct}
              onChange={(e) => setConfig({ ...config, nodeInfraMarginPct: Number(e.target.value) })}
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-zinc-500">
            Core Logic Margin (%)
            <input
              type="number"
              className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
              value={config.coreLogicMarginPct}
              onChange={(e) => setConfig({ ...config, coreLogicMarginPct: Number(e.target.value) })}
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveConfig}
            className="px-4 py-2 bg-white text-black rounded-md text-sm font-semibold hover:bg-zinc-200 transition-colors"
            disabled={savingConfig}
          >
            {savingConfig ? "Saving..." : "Save Cost Inputs"}
          </button>
          <span className="text-xs text-zinc-500">Applies across all AI Managers.</span>
        </div>

        <div className="border border-zinc-800 rounded-lg overflow-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-4 py-3">AI Manager</th>
                <th className="px-4 py-3">Avg Messages / Day</th>
                <th className="px-4 py-3">Avg Tokens / Message</th>
                <th className="px-4 py-3">Calendar Sync Estimate (₹/month)</th>
                <th className="px-4 py-3">Integration API Estimate (₹/month)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {managers.map((manager) => {
                const estimate = estimateBySlug.get(manager.slug);
                const inputs = estimate?.inputs || {
                  avgMessagesPerDay: 0,
                  avgTokensPerMessage: 0,
                  calendarSyncMonthlyCost: 0,
                  integrationApiMonthlyCost: 0,
                  updatedAt: null
                };
                return (
                  <tr key={manager.slug} className="bg-zinc-950/40">
                    <td className="px-4 py-3 text-white font-medium">{manager.name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-28 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200"
                        value={inputs.avgMessagesPerDay}
                        onChange={(e) =>
                          setEstimates((prev) =>
                            prev.map((item) =>
                              item.slug === manager.slug
                                ? { ...item, inputs: { ...item.inputs, avgMessagesPerDay: Number(e.target.value) } }
                                : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-28 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200"
                        value={inputs.avgTokensPerMessage}
                        onChange={(e) =>
                          setEstimates((prev) =>
                            prev.map((item) =>
                              item.slug === manager.slug
                                ? { ...item, inputs: { ...item.inputs, avgTokensPerMessage: Number(e.target.value) } }
                                : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-32 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200"
                        value={inputs.calendarSyncMonthlyCost}
                        onChange={(e) =>
                          setEstimates((prev) =>
                            prev.map((item) =>
                              item.slug === manager.slug
                                ? { ...item, inputs: { ...item.inputs, calendarSyncMonthlyCost: Number(e.target.value) } }
                                : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-32 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200"
                        value={inputs.integrationApiMonthlyCost}
                        onChange={(e) =>
                          setEstimates((prev) =>
                            prev.map((item) =>
                              item.slug === manager.slug
                                ? { ...item, inputs: { ...item.inputs, integrationApiMonthlyCost: Number(e.target.value) } }
                                : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => saveInputs(manager.slug, inputs)}
                        className="px-3 py-1 text-xs font-semibold border border-zinc-700 rounded text-zinc-200 hover:bg-zinc-800"
                        disabled={savingSlug === manager.slug}
                      >
                        {savingSlug === manager.slug ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {managers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                    No AI Managers available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Cost Calculator</h2>
        <div className="border border-zinc-800 rounded-lg overflow-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-4 py-3">AI Manager</th>
                <th className="px-4 py-3">Token Cost</th>
                <th className="px-4 py-3">Infra Cost</th>
                <th className="px-4 py-3">Total Cost</th>
                <th className="px-4 py-3">Suggested Minimum</th>
                <th className="px-4 py-3">Base Price</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {managers.map((manager) => {
                const estimate = estimateBySlug.get(manager.slug);
                if (!estimate) {
                  return (
                    <tr key={manager.slug}>
                      <td className="px-4 py-3 text-white font-medium">{manager.name}</td>
                      <td className="px-4 py-3 text-zinc-500" colSpan={6}>No estimates</td>
                    </tr>
                  );
                }
                const warning = manager.baseMonthlyPrice < estimate.estimatedMonthlyTotalCost;
                return (
                  <tr key={manager.slug} className="bg-zinc-950/40">
                    <td className="px-4 py-3 text-white font-medium">{manager.name}</td>
                    <td className="px-4 py-3">₹{formatCurrency(estimate.estimatedMonthlyTokenCost)}</td>
                    <td className="px-4 py-3">₹{formatCurrency(estimate.estimatedMonthlyInfraCost)}</td>
                    <td className="px-4 py-3">₹{formatCurrency(estimate.estimatedMonthlyTotalCost)}</td>
                    <td className="px-4 py-3">₹{formatCurrency(estimate.suggestedMinimumPrice)}</td>
                    <td className="px-4 py-3">₹{formatCurrency(manager.baseMonthlyPrice)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider ${warning ? "bg-red-900/30 text-red-300 border-red-900" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                        {warning ? "Warning" : "OK"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {managers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-zinc-500">
                    No estimates available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Pricing History</h2>
        <div className="border border-zinc-800 rounded-lg overflow-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-4 py-3">AI Manager</th>
                <th className="px-4 py-3">Old Price</th>
                <th className="px-4 py-3">New Price</th>
                <th className="px-4 py-3">Changed By</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {history.map((entry) => (
                <tr key={`${entry.manager_slug}-${entry.timestamp}`}>
                  <td className="px-4 py-3 text-white font-medium">{entry.manager_slug}</td>
                  <td className="px-4 py-3">₹{formatCurrency(Number(entry.old_price || 0))}</td>
                  <td className="px-4 py-3">₹{formatCurrency(Number(entry.new_price || 0))}</td>
                  <td className="px-4 py-3 text-zinc-400">{entry.changed_by || "System"}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-zinc-500">
                    No pricing changes recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
