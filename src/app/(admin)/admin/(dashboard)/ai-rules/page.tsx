"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

type AIRule = {
  ruleId: string;
  scope: "global" | "role";
  action: string;
  limit: string;
};

type RuleImpact = {
  affectedManagers: Array<{ slug: string; name: string; impactedRules: string[] }>;
  blockedActions: Array<{ action: string; reason: string }>;
  preventedLogs: Array<{ id: string; manager: string; action: string; reason: string; timestamp: string }>;
};

export default function AdminAiRulesPage() {
  const [rules, setRules] = useState<AIRule[]>([]);
  const [impact, setImpact] = useState<RuleImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/ai-rules", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load AI rules.");
      }
      const data = await response.json();
      setRules(data.rules || []);
      setImpact(data.impact || null);
    } catch (err: any) {
      setError(err?.message || "Unable to load AI rules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const updateRuleLimit = (ruleId: string, limit: string) => {
    setRules((prev) => prev.map((rule) => (rule.ruleId === ruleId ? { ...rule, limit } : rule)));
  };

  const saveRules = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const response = await fetch("/api/admin/ai-rules/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules })
      });
      if (!response.ok) {
        throw new Error("Unable to update rules.");
      }
      const data = await response.json();
      setRules(data.rules || rules);
      setMessage("Rules updated.");
    } catch (err: any) {
      setMessage(err?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

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
    <div className="space-y-8 pb-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Rules</h1>
          <p className="text-zinc-400">Global safety limits override user behavior settings.</p>
        </div>
        <button
          onClick={loadRules}
          className="inline-flex items-center gap-2 text-xs text-zinc-300 border border-zinc-700 px-3 py-2 rounded-lg hover:border-zinc-500"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
        <div className="flex items-start gap-3 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <div>
            Changes here apply to every AI Manager. Users cannot override these limits.
          </div>
        </div>
        <div className="grid gap-4">
          {rules.map((rule) => (
            <div key={rule.ruleId} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">{rule.action}</div>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">{rule.scope}</span>
              </div>
              <input
                value={rule.limit}
                onChange={(event) => updateRuleLimit(rule.ruleId, event.target.value)}
                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
              />
              <div className="text-xs text-zinc-500">Limit or keyword list enforced by the control layer.</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-400">{message}</div>
          <button
            onClick={saveRules}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-100 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Rules"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Rule Impact</h2>
          {impact?.affectedManagers?.length ? (
            <div className="space-y-3">
              {impact.affectedManagers.map((manager) => (
                <div key={manager.slug} className="border border-zinc-800 rounded-lg p-4">
                  <div className="text-sm font-semibold text-white">{manager.name}</div>
                  <div className="text-xs text-zinc-500 mt-2">
                    {manager.impactedRules.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-zinc-500">No impacted managers recorded.</div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Blocked Actions</h2>
          {impact?.blockedActions?.length ? (
            <div className="space-y-3">
              {impact.blockedActions.map((item, index) => (
                <div key={`${item.action}-${index}`} className="border border-zinc-800 rounded-lg p-4">
                  <div className="text-sm font-semibold text-white">{item.action}</div>
                  <div className="text-xs text-zinc-500 mt-2">{item.reason}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-zinc-500">No blocked actions recorded.</div>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Prevented Actions Log</h2>
        <div className="space-y-3">
          {impact?.preventedLogs?.length ? (
            impact.preventedLogs.map((log) => (
              <div key={log.id} className="border border-zinc-800 rounded-lg p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">{log.action}</div>
                  <div className="text-xs text-zinc-500 mt-2">{log.reason}</div>
                </div>
                <div className="text-xs text-zinc-400 text-right">
                  <div>{log.manager}</div>
                  <div className="mt-2">{new Date(log.timestamp).toLocaleString("en-IN")}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-zinc-500">No prevented actions recorded.</div>
          )}
        </div>
      </div>
    </div>
  );
}
