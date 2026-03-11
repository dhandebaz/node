import { getSupabaseServer } from "@/lib/supabase/server";
import { Loader2, RefreshCw, Filter } from "lucide-react";
import { EVENT_TYPES } from "@/types/events";
import Link from "next/link";

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

// Server Component
export default async function AuditEventsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const limit = 50;
  const offset = (page - 1) * limit;
  
  const eventType = params.event_type || 'all';
  const actorType = params.actor_type || 'all';
  const tenantId = params.tenant_id || '';
  
  const supabase = await getSupabaseServer();
  
  let query = supabase
    .from("audit_events")
    .select(`
        *,
        tenants ( name ),
        users:actor_id ( email, full_name )
    `, { count: 'exact' });

  if (eventType !== 'all') query = query.eq('event_type', eventType);
  if (actorType !== 'all') query = query.eq('actor_type', actorType);
  if (tenantId) query = query.eq('tenant_id', tenantId);
  
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  
  if (error) {
      return <div className="p-8 text-red-400">Error loading logs: {error.message}</div>;
  }

  const events = (data || []) as unknown as AuditEvent[]; // Cast due to joined types
  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-zinc-400">Forensic trail of all system, user, and admin actions.</p>
        </div>
        <Link
          href="/admin/audit"
          className="inline-flex items-center gap-2 text-xs text-white/70 border border-white/20 px-3 py-2 rounded-lg hover:border-white/40"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Filters
        </Link>
      </div>

      {/* Filter Form (Simple GET form) */}
      <form className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          Event Type
          <select
            name="event_type"
            defaultValue={eventType}
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
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
            name="actor_type"
            defaultValue={actorType}
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
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
            name="tenant_id"
            defaultValue={tenantId}
            type="text"
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
            placeholder="UUID..."
          />
        </label>
        <div className="flex items-end">
            <button type="submit" className="w-full bg-white text-black font-medium py-2 rounded text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" />
                Apply Filters
            </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
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

        {/* Pagination */}
        {events.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
            <Link
              href={{ query: { ...params, page: Math.max(1, page - 1) } }}
              className={`px-4 py-2 text-sm text-zinc-400 hover:text-white ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
            >
              Previous
            </Link>
            <span className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <Link
              href={{ query: { ...params, page: Math.min(totalPages, page + 1) } }}
              className={`px-4 py-2 text-sm text-zinc-400 hover:text-white ${page === totalPages ? 'pointer-events-none opacity-50' : ''}`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
