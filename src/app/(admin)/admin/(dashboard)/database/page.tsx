"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { Database, Search, Loader2, AlertTriangle, ChevronLeft, ChevronRight, Eye, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const ALLOWED_TABLES = [
  { name: "tenants", label: "Tenants" },
  { name: "users", label: "Users" },
  { name: "bookings", label: "Bookings" },
  { name: "guests", label: "Guests" },
  { name: "contacts", label: "Contacts" },
  { name: "conversations", label: "Conversations" },
  { name: "messages", label: "Messages" },
  { name: "wallets", label: "Wallets" },
  { name: "wallet_transactions", label: "Wallet Transactions" },
  { name: "system_flags", label: "System Flags" },
  { name: "failures", label: "Failures" },
  { name: "system_logs", label: "System Logs" },
  { name: "tenant_users", label: "Tenant Users" },
  { name: "integrations", label: "Integrations" },
];

export default function AdminDatabasePage() {
  const [table, setTable] = useState("tenants");
  const [data, setData] = useState<{ columns: string[]; rows: any[]; total: number; page: number; pages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        table,
        page: page.toString(),
        limit: "20",
        sort: "created_at",
        order: "desc",
      });
      const result = await fetchWithAuth<typeof data>(`/api/admin/database?${params}`);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadData();
  }, [table]);

  useEffect(() => {
    loadData();
  }, [page]);

  const formatValue = (value: any): string => {
    if (value === null) return "null";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "boolean") return value ? "true" : "false";
    return String(value);
  };

  const truncate = (str: string, len: number = 30) => {
    if (!str) return "-";
    return str.length > len ? str.substring(0, len) + "..." : str;
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Database <span className="text-primary/40">Explorer</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Read-only access to system tables
          </p>
        </div>
        <div className="flex items-center gap-3 bg-destructive/5 px-6 py-4 rounded-2xl border border-destructive/20">
          <Lock className="w-4 h-4 text-destructive" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive">Read Only</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-64 shrink-0">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block">Select Table</label>
          <select
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="w-full px-4 py-3 bg-card border border-border rounded-2xl text-sm font-medium focus:outline-none focus:border-primary/50"
          >
            {ALLOWED_TABLES.map((t) => (
              <option key={t.name} value={t.name}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          {data && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Total: <strong className="text-foreground">{data.total}</strong></span>
              <span>Page: <strong className="text-foreground">{data.page}/{data.pages}</strong></span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <span className="text-destructive text-sm">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : data && data.rows.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Database className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No data found in {table}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em] border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-16">#</th>
                  {data?.columns.slice(0, 6).map((col) => (
                    <th key={col} className="px-4 py-3">{col}</th>
                  ))}
                  <th className="px-4 py-3 w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.rows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground/40 font-mono text-xs">
                      {(page - 1) * 20 + idx + 1}
                    </td>
                    {data.columns.slice(0, 6).map((col) => (
                      <td key={col} className="px-4 py-3">
                        <span className="font-mono text-xs text-foreground/80" title={formatValue(row[col])}>
                          {truncate(formatValue(row[col]))}
                        </span>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedRow(row)}
                        className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-muted/50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.pages}
              </span>
              <button
                onClick={() => setPage(Math.min(data.pages, page + 1))}
                disabled={page === data.pages}
                className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-muted/50 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {selectedRow && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Row Details</h3>
              <button
                onClick={() => setSelectedRow(null)}
                className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(selectedRow).map(([key, value]) => (
                <div key={key} className="flex gap-4">
                  <div className="w-48 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{key}</span>
                  </div>
                  <div className="flex-1 break-all">
                    <code className="text-xs font-mono text-foreground/80 bg-muted/30 px-2 py-1 rounded block">
                      {formatValue(value)}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
