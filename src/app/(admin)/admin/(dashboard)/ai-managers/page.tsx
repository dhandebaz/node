"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Loader2, X, Sparkles, Activity, ShieldCheck, DollarSign } from "lucide-react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { cn } from "@/lib/utils";

type ManagerRow = {
  slug: string;
  name: string;
  status: "active" | "disabled";
  baseMonthlyPrice: number;
  updatedAt: string | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  return fetchWithAuth<T>(url, { cache: "no-store" });
}

export default function AdminAiManagersPage() {
  const [managers, setManagers] = useState<ManagerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ManagerRow | null>(null);
  const [saving, setSaving] = useState(false);

  const loadManagers = () => {
    setLoading(true);
    fetchJson<{ managers: ManagerRow[] }>("/api/admin/ai-managers")
      .then((payload) => {
        setManagers(payload.managers || []);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const saveManager = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await fetchWithAuth("/api/admin/ai-managers/update", {
        method: "POST",
        body: JSON.stringify({
          slug: selected.slug,
          baseMonthlyPrice: selected.baseMonthlyPrice,
          status: selected.status
        })
      });
      setSelected(null);
      loadManagers();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              AI <span className="text-primary/40">Managers</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Intelligence node availability & revenue orchestration
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-96 bg-card/30 border border-border/50 rounded-3xl border-dashed">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Synchronizing Intelligence Registry</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-destructive text-sm font-black uppercase tracking-widest flex items-center gap-4">
          <X className="w-5 h-5" />
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 opacity-20" />
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-1/4">Intelligence Node</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Compliance</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Authority Pricing</th>
                <th className="px-4 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Last Sync</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right">Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {managers.map((manager) => (
                <tr key={manager.slug} className="group/row hover:bg-muted/30 transition-all">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center border border-border group-hover/row:border-primary/20 transition-colors">
                        <Activity className="w-4 h-4 text-muted-foreground/40 group-hover/row:text-primary transition-colors" />
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase tracking-widest text-foreground">{manager.name}</div>
                        <div className="text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground/20 mt-0.5 group-hover/row:text-primary/30 transition-colors">{manager.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm flex items-center gap-2 w-fit",
                      manager.status === "active" 
                        ? "bg-success/10 text-success border-success/20 shadow-success/5" 
                        : "bg-muted text-muted-foreground/40 border-border"
                    )}>
                      {manager.status === "active" && <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />}
                      {manager.status}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2 text-foreground font-black text-sm">
                      <span className="text-muted-foreground/20 text-xs">₹</span>
                      {new Intl.NumberFormat("en-IN").format(manager.baseMonthlyPrice)}
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/20 ml-1">/ PCM</span>
                    </div>
                  </td>
                  <td className="px-4 py-8 text-muted-foreground/30 text-[10px] font-mono uppercase">
                    {manager.updatedAt ? new Date(manager.updatedAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-8 py-8 text-right">
                    <button
                      onClick={() => setSelected(manager)}
                      className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-foreground text-background rounded-xl hover:opacity-90 transition-all transform active:scale-95 shadow-lg"
                    >
                      Configure Port
                    </button>
                  </td>
                </tr>
              ))}
              {managers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center border border-border mb-4 opacity-20">
                        <Activity className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Zero Intelligence Nodes Configured</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-[480px] h-[calc(100%-2rem)] m-4 bg-card border border-border rounded-[2.5rem] p-10 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Sparkles className="w-48 h-48 text-primary" />
            </div>
            <div className="flex items-start justify-between mb-12 relative z-10">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Port Configuration</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <p className="text-[10px] font-mono font-black uppercase tracking-widest text-primary/50">{selected.slug}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelected(null)} 
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-all hover:rotate-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-10 flex-1 overflow-y-auto relative z-10 pr-2 custom-scrollbar">
              <div className="bg-muted/20 border border-border rounded-2xl p-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-4 block">Identity Matrix</label>
                <div className="text-lg font-black uppercase tracking-tight text-foreground mb-1">{selected.name}</div>
                <div className="text-[11px] font-mono font-bold text-muted-foreground/20 uppercase tracking-widest italic">{selected.slug}</div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-3 ml-2 block">Monthly Revenue Protocol (PCM)</label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/20 font-black text-sm transition-colors group-focus-within/input:text-primary">₹</div>
                    <input
                      type="number"
                      className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-6 py-4 text-sm text-foreground font-black focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                      value={selected.baseMonthlyPrice}
                      onChange={(e) => setSelected({ ...selected, baseMonthlyPrice: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-3 ml-2 block">Deployment Status</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelected({ ...selected, status: 'active' })}
                      className={cn(
                        "py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        selected.status === 'active' 
                          ? "bg-success/10 border-success/30 text-success shadow-lg shadow-success/10" 
                          : "bg-muted/30 border-border text-muted-foreground/20 hover:bg-muted"
                      )}
                    >
                      Live Deployment
                    </button>
                    <button
                      onClick={() => setSelected({ ...selected, status: 'disabled' })}
                      className={cn(
                        "py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        selected.status === 'disabled' 
                          ? "bg-destructive/10 border-destructive/30 text-destructive shadow-lg shadow-destructive/10" 
                          : "bg-muted/30 border-border text-muted-foreground/20 hover:bg-muted"
                      )}
                    >
                      Decommissioned
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 mt-6 border-t border-border relative z-10">
              <button
                onClick={saveManager}
                className="w-full py-5 bg-foreground text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-all transform active:scale-95 shadow-2xl disabled:opacity-30 flex items-center justify-center gap-3"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Syncing Matrix...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Commit Authority Change
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
