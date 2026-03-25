"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, ShieldCheck, Activity, Target } from "lucide-react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { cn } from "@/lib/utils";

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
      const data = await fetchWithAuth<{ rules?: AIRule[] }>("/api/admin/ai-rules/update", {
        method: "POST",
        body: JSON.stringify({ rules })
      });
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
      <div className="flex flex-col items-center justify-center h-96 bg-card/30 border border-border/50 rounded-3xl border-dashed">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Analyzing Global Safety Matrix</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-destructive text-sm font-black uppercase tracking-widest flex items-center gap-4">
        <AlertTriangle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Safety <span className="text-primary/40">Matrix</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Global security protocols & behavioral overrides
          </p>
        </div>
        <button
          onClick={loadRules}
          className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-background text-foreground border-2 border-border hover:border-primary/40 transition-all flex items-center gap-3 active:scale-95 shadow-sm group"
        >
          <RefreshCw className="w-4 h-4 text-primary transition-transform group-hover:rotate-180" />
          Sync_Registry
        </button>
      </div>

      <div className="bg-card border border-border rounded-[2rem] p-10 space-y-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <ShieldCheck className="w-48 h-48 text-primary" />
        </div>

        <div className="flex items-start gap-4 p-5 bg-warning/5 border border-warning/10 rounded-2xl relative z-10">
          <AlertTriangle className="w-5 h-5 text-warning mt-1 shrink-0" />
          <p className="text-xs font-bold text-warning/80 leading-relaxed uppercase tracking-wide">
            Authority override active: These parameters are immutable at the user level and affect all deployed Intelligence Nodes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {rules.map((rule) => (
            <div key={rule.ruleId} className="bg-muted/20 border border-border rounded-2xl p-6 space-y-6 hover:border-primary/20 transition-all group/rule">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{rule.action}</div>
                <span className="px-2 py-1 rounded-full text-[8px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">{rule.scope}</span>
              </div>
              <div className="relative group/input">
                <input
                  value={rule.limit}
                  onChange={(event) => updateRuleLimit(rule.ruleId, event.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground font-black focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner placeholder:opacity-20"
                  placeholder="Set limit..."
                />
              </div>
              <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest leading-relaxed">Safety threshold enforced at the control gateway.</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-10 border-t border-border mt-4 relative z-10">
          <div className="text-[10px] font-black uppercase tracking-widest text-success flex items-center gap-2">
            {message && <><div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> {message}</>}
          </div>
          <button
            onClick={saveRules}
            disabled={saving}
            className="px-10 py-4 bg-foreground text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-all transform active:scale-95 shadow-2xl disabled:opacity-30 flex items-center gap-3"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Synchronizing...</> : "Commit Safety Matrix"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-[2.5rem] p-10 space-y-8 shadow-lg">
          <h2 className="text-lg font-black uppercase tracking-tight text-foreground flex items-center gap-4">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center border border-border text-primary/40">
              <Activity className="w-5 h-5" />
            </div>
            Node Propagation
          </h2>
          {impact?.affectedManagers?.length ? (
            <div className="grid gap-4">
              {impact.affectedManagers.map((manager) => (
                <div key={manager.slug} className="group/impact bg-muted/10 border border-border rounded-2xl p-6 hover:bg-muted/20 transition-all">
                  <div className="text-sm font-black uppercase tracking-widest text-foreground group-hover/impact:text-primary transition-colors">{manager.name}</div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {manager.impactedRules.map((rule) => (
                      <span key={rule} className="px-3 py-1 bg-card border border-border rounded-lg text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{rule}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/20 text-center py-10 italic">Zero impact vectors detected.</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-[2.5rem] p-10 space-y-8 shadow-lg">
          <h2 className="text-lg font-black uppercase tracking-tight text-foreground flex items-center gap-4">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center border border-border text-destructive/40">
              <Target className="w-5 h-5" />
            </div>
            Active Interdictions
          </h2>
          {impact?.blockedActions?.length ? (
            <div className="grid gap-4">
              {impact.blockedActions.map((item, index) => (
                <div key={`${item.action}-${index}`} className="group/block bg-destructive/5 border border-destructive/10 rounded-2xl p-6 hover:bg-destructive/10 transition-all">
                  <div className="text-sm font-black uppercase tracking-widest text-destructive">{item.action}</div>
                  <div className="text-[10px] font-bold text-muted-foreground/40 mt-2 uppercase tracking-wide leading-relaxed">{item.reason}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/20 text-center py-10 italic">No blocked operations in current cycle.</p>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-lg group">
        <h2 className="text-lg font-black uppercase tracking-tight text-foreground mb-8">Incident Ledger</h2>
        <div className="space-y-4">
          {impact?.preventedLogs?.length ? (
            impact.preventedLogs.map((log) => (
              <div key={log.id} className="group/log bg-muted/10 border border-border rounded-2xl p-6 flex items-center justify-between gap-8 hover:bg-muted/20 transition-all">
                <div className="flex-1">
                  <div className="text-sm font-black uppercase tracking-widest text-foreground group-hover/log:text-primary transition-colors">{log.action}</div>
                  <div className="text-[10px] font-bold text-muted-foreground/30 mt-2 uppercase tracking-wide italic">{log.reason}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="px-3 py-1 bg-card border border-border rounded-lg text-[9px] font-black uppercase tracking-widest text-primary mb-2 shadow-sm inline-block">{log.manager}</div>
                  <div className="text-[10px] font-mono text-muted-foreground/20 font-bold">{new Date(log.timestamp).toLocaleString("en-IN")}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center py-20 bg-muted/5 border border-dashed border-border rounded-3xl opacity-20">
              <Activity className="w-12 h-12 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Log Archive Clear</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
