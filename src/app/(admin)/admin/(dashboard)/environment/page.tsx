"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { Settings, CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnvStatus {
  status: "healthy" | "degraded";
  summary: {
    total: number;
    required_missing: number;
    optional_missing: number;
    all_set: boolean;
  };
  by_category: Record<string, Array<{
    name: string;
    is_set: boolean;
    is_sensitive: boolean;
    is_required: boolean;
    category: string;
    display_value: string;
  }>>;
}

export default function AdminEnvironmentPage() {
  const [data, setData] = useState<EnvStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSensitive, setShowSensitive] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWithAuth<EnvStatus>("/api/admin/environment");
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load environment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Environment <span className="text-primary/40">Status</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Configuration variables &amp; deployment status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSensitive(!showSensitive)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
              showSensitive 
                ? "bg-warning/10 text-warning border border-warning/20" 
                : "bg-muted/30 text-muted-foreground border border-border hover:bg-muted/50"
            )}
          >
            {showSensitive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {showSensitive ? "Hide Values" : "Show Values"}
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-3 bg-muted/30 px-6 py-4 rounded-2xl border border-border shadow-inner hover:bg-muted/50 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6">
          <p className="text-destructive">{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Status Banner */}
          <div className={cn(
            "p-6 rounded-2xl border flex items-center gap-4",
            data.status === "healthy" 
              ? "bg-success/10 border-success/30" 
              : "bg-warning/10 border-warning/30"
          )}>
            {data.status === "healthy" ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-warning" />
            )}
            <div>
              <h3 className="font-black uppercase tracking-widest text-foreground">
                {data.status === "healthy" ? "All Required Variables Set" : "Missing Required Variables"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {data.summary.required_missing} required, {data.summary.optional_missing} optional variables missing
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2">Total Variables</span>
              <div className="text-3xl font-black text-foreground">{data.summary.total}</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2">Required Set</span>
              <div className="text-3xl font-black text-success">{data.summary.total - data.summary.required_missing}</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2">Required Missing</span>
              <div className={cn(
                "text-3xl font-black",
                data.summary.required_missing > 0 ? "text-warning" : "text-foreground"
              )}>{data.summary.required_missing}</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2">Optional Missing</span>
              <div className="text-3xl font-black text-muted-foreground">{data.summary.optional_missing}</div>
            </div>
          </div>

          {/* By Category */}
          {Object.entries(data.by_category).map(([category, vars]) => (
            <div key={category} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  {category}
                </h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-muted/30 text-muted-foreground uppercase text-[9px] font-black tracking-[0.2em] border-b border-border/50">
                  <tr>
                    <th className="px-6 py-3">Variable</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Value</th>
                    <th className="px-6 py-3">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {vars.map((v) => (
                    <tr key={v.name} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-mono text-sm text-foreground">{v.name}</span>
                      </td>
                      <td className="px-6 py-3">
                        {v.is_set ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20">
                            <CheckCircle className="w-3 h-3" /> SET
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-destructive/10 text-destructive border border-destructive/20">
                            <XCircle className="w-3 h-3" /> MISSING
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {v.is_sensitive && !showSensitive ? "••••••••" : v.display_value}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {v.is_required ? (
                          <span className="text-warning text-xs font-bold uppercase">Required</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">Optional</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
