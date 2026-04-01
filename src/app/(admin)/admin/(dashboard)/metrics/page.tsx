"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { Activity, Clock, AlertTriangle, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Metrics {
  metrics: {
    requests_last_hour: number;
    requests_last_day: number;
    errors_last_day: number;
    total_requests: number;
    error_rate: string;
  };
  service_breakdown: Record<string, number>;
  timestamp: string;
}

export default function AdminMetricsPage() {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWithAuth<Metrics>("/api/admin/metrics");
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  const errorRate = data ? parseFloat(data.metrics.error_rate) : 0;
  const isHealthy = errorRate < 5;

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              API <span className="text-primary/40">Metrics</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            System performance &amp; request analytics
          </p>
        </div>
        <button
          onClick={loadMetrics}
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
          {/* Status Banner */}
          <div className={cn(
            "p-6 rounded-2xl border flex items-center gap-4",
            isHealthy 
              ? "bg-success/10 border-success/30" 
              : "bg-warning/10 border-warning/30"
          )}>
            {isHealthy ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-warning" />
            )}
            <div>
              <h3 className="font-black uppercase tracking-widest text-foreground">
                {isHealthy ? "System Healthy" : "Elevated Error Rate"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isHealthy 
                  ? "All systems operating within normal parameters" 
                  : `Error rate is ${errorRate}% - above the 5% threshold`}
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">This Hour</span>
                <Clock className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div className="text-3xl font-black text-foreground">
                {data.metrics.requests_last_hour.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">requests</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Today</span>
                <Activity className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div className="text-3xl font-black text-foreground">
                {data.metrics.requests_last_day.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">requests</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Errors Today</span>
                <AlertTriangle className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div className={cn(
                "text-3xl font-black",
                data.metrics.errors_last_day > 0 ? "text-destructive" : "text-foreground"
              )}>
                {data.metrics.errors_last_day.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">failed requests</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Error Rate</span>
                <Activity className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div className={cn(
                "text-3xl font-black",
                errorRate > 5 ? "text-warning" : errorRate > 10 ? "text-destructive" : "text-foreground"
              )}>
                {data.metrics.error_rate}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">of total requests</p>
            </div>
          </div>

          {/* Service Breakdown */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-6">
              Activity by Service (Last 24h)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(data.service_breakdown).map(([service, count]) => (
                <div key={service} className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-lg font-black text-foreground capitalize">{service}</div>
                  <div className="text-sm text-muted-foreground">{count.toLocaleString()}</div>
                </div>
              ))}
              {Object.keys(data.service_breakdown).length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-8">No activity recorded</p>
              )}
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center text-sm text-muted-foreground">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
