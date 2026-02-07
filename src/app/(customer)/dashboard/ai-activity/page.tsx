"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";

type ActivityItem = {
  id: string;
  timestamp: string;
  action: string;
  reason: string;
  outcome: "sent" | "blocked" | "escalated";
  manager: string;
};

export default function AiActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/ai/activity");
      if (!response.ok) {
        throw new Error("Unable to load AI activity.");
      }
      const data = await response.json();
      setItems(data.items || []);
    } catch (err: any) {
      setError(err?.message || "Unable to load AI activity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const iconForOutcome = (outcome: ActivityItem["outcome"]) => {
    if (outcome === "sent") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (outcome === "blocked") return <XCircle className="w-4 h-4 text-red-400" />;
    return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">AI Activity Log</h1>
          <p className="text-zinc-400">Every AI action is explainable and reviewable.</p>
        </div>
        <button
          onClick={loadActivity}
          className="inline-flex items-center gap-2 text-xs text-white/70 border border-white/20 px-3 py-2 rounded-lg hover:border-white/40"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-60 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading activity...
        </div>
      )}

      {!loading && error && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-zinc-300">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-zinc-800">
            {items.length === 0 && (
              <div className="p-6 text-zinc-500 text-sm">No AI activity yet.</div>
            )}
            {items.map((item) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{iconForOutcome(item.outcome)}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.action}</div>
                    <div className="text-xs text-zinc-400 mt-1">{item.reason}</div>
                    <div className="text-[11px] text-zinc-500 mt-2">
                      {new Date(item.timestamp).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2 py-1 rounded-full border border-zinc-700 text-zinc-300 uppercase tracking-wider">
                    {item.manager}
                  </span>
                  <span className="px-2 py-1 rounded-full border border-zinc-700 text-zinc-300 uppercase tracking-wider">
                    {item.outcome}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
