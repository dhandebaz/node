"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
        <h1 className="text-2xl font-bold text-white">System Logs</h1>
        <p className="text-zinc-400">AI reply failures, payment webhooks, integrations, and calendar sync errors.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          Severity
          <select
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
        </label>
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          Service
          <select
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
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
      </div>

      {loading && (
        <div className="flex items-center justify-center h-72">
          <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-300">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="border border-zinc-800 rounded-lg overflow-auto bg-zinc-950/60">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3">{log.severity}</td>
                  <td className="px-4 py-3">{log.service}</td>
                  <td className="px-4 py-3 text-zinc-400">{log.message}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-zinc-500">
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
