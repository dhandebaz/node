"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LogEntry = {
  id: string;
  severity: string;
  service: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any> | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Request failed");
  }
  return response.json();
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severity, setSeverity] = useState("all");
  const [service, setService] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (severity !== "all") params.set("severity", severity);
    if (service !== "all") params.set("service", service);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);

    fetchJson<{ logs: LogEntry[] }>(`/api/admin/logs?${params.toString()}`)
      .then((payload) => {
        setLogs(payload.logs || []);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, [severity, service, dateFrom, dateTo]);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Logs</h1>
        <p className="text-muted-foreground">AI reply failures, payment webhooks, integrations, and calendar sync errors.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Severity
          <select
            className="mt-2 w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
        </label>
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Service
          <select
            className="mt-2 w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="all">All</option>
            <option value="ai">AI</option>
            <option value="payments">Payments</option>
            <option value="integrations">Integrations</option>
            <option value="calendar">Calendar</option>
          </select>
        </label>
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Date From
          <input
            type="date"
            className="mt-2 w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </label>
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Date To
          <input
            type="date"
            className="mt-2 w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </label>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-72">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-foreground font-medium shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-black tracking-widest sticky top-0">
              <tr>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border",
                      log.severity === 'error' ? "bg-destructive/10 text-destructive border-destructive/20" : 
                      log.severity === 'warn' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                      "bg-primary/10 text-primary border-primary/20"
                    )}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground capitalize">{log.service}</td>
                  <td className="px-6 py-4 text-muted-foreground font-medium">{log.message}</td>
                  <td className="px-6 py-4 text-muted-foreground/60 font-mono text-xs italic">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-bold">
                    No logs available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
