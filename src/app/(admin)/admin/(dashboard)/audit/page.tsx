"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { EVENT_TYPES } from "@/types/events";

type AuditEvent = {
  id: string;
  created_at: string;
  actor_type: string;
  actor_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  tenants: { name: string } | null;
  users: { email: string; full_name: string | null } | null;
};

type ApiResponse = {
  events: AuditEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Request failed");
  }
  return response.json();
}

export default function AuditEventsPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [eventType, setEventType] = useState("all");
  const [actorType, setActorType] = useState("all");
  const [tenantId, setTenantId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadEvents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "50");
    
    if (eventType !== "all") params.set("event_type", eventType);
    if (actorType !== "all") params.set("actor_type", actorType);
    if (tenantId) params.set("tenant_id", tenantId);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);

    fetchJson<ApiResponse>(`/api/admin/audit-events?${params.toString()}`)
      .then((payload) => {
        setEvents(payload.events || []);
        setTotalPages(payload.pagination.totalPages);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, [page, eventType, actorType, tenantId, dateFrom, dateTo]);

  const handleRefresh = () => {
    loadEvents();
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-zinc-400">Forensic trail of all system, user, and admin actions.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 text-xs text-white/70 border border-white/20 px-3 py-2 rounded-lg hover:border-white/40"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          Event Type
          <select
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
            value={eventType}
            onChange={(e) => { setEventType(e.target.value); setPage(1); }}
          >
            <option value="all">All Events</option>
            {Object.values(EVENT_TYPES).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          Actor Type
          <select
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
            value={actorType}
            onChange={(e) => { setActorType(e.target.value); setPage(1); }}
          >
            <option value="all">All Actors</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="system">System</option>
            <option value="ai">AI</option>
          </select>
        </label>
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          Tenant ID
          <input
            type="text"
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
            placeholder="UUID..."
            value={tenantId}
            onChange={(e) => { setTenantId(e.target.value); setPage(1); }}
          />
        </label>
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          From
          <input
            type="date"
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          />
        </label>
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          To
          <input
            type="date"
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          />
        </label>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
          </div>
        )}
        
        {!loading && error && (
          <div className="p-12 text-center text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Tenant</th>
                  <th className="px-6 py-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{event.actor_type.toUpperCase()}</div>
                      <div className="text-xs text-zinc-500 truncate max-w-[150px]" title={event.actor_id}>
                        {event.users?.email || event.actor_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800">
                        {event.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      <div className="text-white mb-0.5">{event.entity_type}</div>
                      <div className="font-mono text-[10px] text-zinc-500">{event.entity_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      {event.tenants ? (
                        <div className="text-white text-sm">{event.tenants.name}</div>
                      ) : (
                        <span className="text-zinc-600 text-xs italic">System / None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const data = event.metadata || {};
                        if (Object.keys(data).length === 0) return <span className="text-zinc-600">-</span>;
                        
                        // Prioritize specific keys for better readability
                        const priorityKeys = ['reason', 'amount', 'credits', 'previous_balance', 'new_balance', 'plan', 'status', 'cost'];
                        const entries = Object.entries(data);
                        const priorityEntries = entries.filter(([k]) => priorityKeys.includes(k));
                        const otherEntries = entries.filter(([k]) => !priorityKeys.includes(k));

                        return (
                          <div className="text-xs space-y-1 min-w-[200px]">
                            {priorityEntries.map(([key, value]) => (
                              <div key={key} className="flex justify-between gap-4 border-b border-zinc-800/50 pb-0.5 last:border-0">
                                <span className="text-zinc-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                <span className="text-zinc-300 font-mono font-medium">{String(value)}</span>
                              </div>
                            ))}
                            {otherEntries.length > 0 && (
                              <details className="group mt-1">
                                <summary className="cursor-pointer text-zinc-600 hover:text-zinc-400 text-[10px] select-none list-none flex items-center gap-1">
                                  <span className="group-open:rotate-90 transition-transform">▸</span> Raw Metadata
                                </summary>
                                <pre className="mt-1 p-2 bg-black/30 rounded border border-zinc-800 text-[10px] text-zinc-400 overflow-x-auto max-w-[250px] scrollbar-thin">
                                  {JSON.stringify(Object.fromEntries(otherEntries), null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      No audit events found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && events.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
