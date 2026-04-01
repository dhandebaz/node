"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { Gauge, AlertTriangle, Clock, Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateLimitData {
  config: {
    default_limit: string;
    analytics_enabled: boolean;
  };
  endpoints: Record<string, { limit: number; remaining: number; reset: number }>;
  recent_blocks: number;
  timestamp: string;
}

export default function AdminRateLimitsPage() {
  const [data, setData] = useState<RateLimitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWithAuth<RateLimitData>("/api/admin/ratelimits");
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load rate limits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Gauge className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Rate <span className="text-primary/40">Limits</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            API rate limiting &amp; throttling controls
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-3 bg-muted/30 px-6 py-4 rounded-2xl border border-border shadow-inner hover:bg-muted/50 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Refresh</span>
        </button>
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
          {/* Config Banner */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
                  Global Configuration
                </h3>
                <p className="text-foreground font-mono">{data.config.default_limit}</p>
              </div>
              <div className="flex items-center gap-2">
                {data.config.analytics_enabled ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-success/10 text-success text-xs font-black uppercase">
                    <CheckCircle className="w-4 h-4" /> Analytics Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-muted/30 text-muted-foreground text-xs font-black uppercase">
                    <XCircle className="w-4 h-4" /> Analytics Disabled
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Endpoints Monitored</span>
                <Gauge className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div className="text-3xl font-black text-foreground">
                {Object.keys(data.endpoints).length}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Recent Blocks</span>
                <AlertTriangle className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div className={cn(
                "text-3xl font-black",
                data.recent_blocks > 0 ? "text-warning" : "text-foreground"
              )}>
                {data.recent_blocks}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Last Updated</span>
                <Clock className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div className="text-lg font-black text-foreground">
                {new Date(data.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Endpoints Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Rate Limit Status by Endpoint
              </h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em] border-b border-border">
                <tr>
                  <th className="px-6 py-4">Endpoint</th>
                  <th className="px-6 py-4">Limit</th>
                  <th className="px-6 py-4">Remaining</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Reset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(data.endpoints).map(([endpoint, stats]) => {
                  const usagePercent = ((stats.limit - stats.remaining) / stats.limit) * 100;
                  return (
                    <tr key={endpoint} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-foreground">{endpoint}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono">
                        {stats.limit}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono">
                        {stats.remaining}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                usagePercent > 80 ? "bg-warning" : "bg-success"
                              )} 
                              style={{ width: `${usagePercent}%` }} 
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            {usagePercent.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-sm">
                        {stats.reset > 0 ? new Date(stats.reset).toLocaleTimeString() : "N/A"}
                      </td>
                    </tr>
                  );
                })}
                {Object.keys(data.endpoints).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No rate limit data available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
