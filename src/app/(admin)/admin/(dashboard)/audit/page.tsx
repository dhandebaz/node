import { getSupabaseServer } from "@/lib/supabase/server";
import { Loader2, RefreshCw, Filter, Activity } from "lucide-react";
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
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Forensic <span className="text-primary/40">Audit</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Complete architectural trail of all system & authority actions
          </p>
        </div>
        <Link
          href="/admin/audit"
          className="group flex items-center gap-3 bg-muted/30 px-6 py-4 rounded-2xl border border-border shadow-inner transition-all hover:bg-muted/50 hover:border-primary/20 active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Reset Signal</span>
        </Link>
      </div>

      {/* Filter Form (Simple GET form) */}
      <form className="bg-card border border-border rounded-2xl p-8 grid grid-cols-1 md:grid-cols-4 gap-6 shadow-sm group">
        <label className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">Event Type</span>
          <select
            name="event_type"
            defaultValue={eventType}
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-xs font-bold tracking-widest text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
          >
            <option value="all">ALL_EVENTS</option>
            {Object.values(EVENT_TYPES).map((type) => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>
        </label>
        <label className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">Actor Identity</span>
          <select
            name="actor_type"
            defaultValue={actorType}
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-xs font-bold tracking-widest text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
          >
            <option value="all">ALL_ACTORS</option>
            <option value="user">USER_PRIME</option>
            <option value="admin">ROOT_ADMIN</option>
            <option value="system">CORE_SYSTEM</option>
            <option value="ai">NEURAL_AGENT</option>
          </select>
        </label>
        <label className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">Tenant ID</span>
          <input
            name="tenant_id"
            defaultValue={tenantId}
            type="text"
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-xs font-bold tracking-widest text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:opacity-20 shadow-inner"
            placeholder="HEX_ID..."
          />
        </label>
        <div className="flex items-end">
            <button type="submit" className="w-full bg-foreground text-background font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.3em] hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-foreground/5 group-hover:shadow-primary/10">
                <Filter className="w-4 h-4" />
                EXECUTE_FILTER
            </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm group">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black tracking-[0.3em] border-b border-border">
                <tr>
                  <th className="px-8 py-6">Timestamp</th>
                  <th className="px-8 py-6">Identity</th>
                  <th className="px-8 py-6">Signal_Type</th>
                  <th className="px-8 py-6">Entity_Unit</th>
                  <th className="px-8 py-6">Authority</th>
                  <th className="px-8 py-6">Data_Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-muted/30 transition-all group/row border-b border-border/50 last:border-0 border-dashed">
                    <td className="px-8 py-6 text-muted-foreground/60 font-mono text-[10px] whitespace-nowrap">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black uppercase tracking-widest text-foreground group-hover/row:text-primary transition-colors text-[10px]">{event.actor_type}</div>
                      <div className="text-[9px] font-bold text-muted-foreground/30 truncate max-w-[150px] font-mono mt-1" title={event.actor_id}>
                        {event.users?.email || event.actor_id}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter bg-primary/10 text-primary border border-primary/20">
                        {event.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground text-xs">
                      <div className="text-foreground font-semibold mb-0.5">{event.entity_type}</div>
                      <div className="font-mono text-[10px] opacity-60">{event.entity_id}</div>
                    </td>
                    <td className="px-6 py-5">
                      {event.tenants ? (
                        <div className="text-foreground text-sm font-medium">{event.tenants.name}</div>
                      ) : (
                        <span className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest italic">System</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {(() => {
                        const data = event.metadata || {};
                        if (Object.keys(data).length === 0) return <span className="text-muted-foreground/30 font-black">-</span>;
                        
                        const priorityKeys = ['reason', 'amount', 'credits', 'previous_balance', 'new_balance', 'plan', 'status', 'cost'];
                        const entries = Object.entries(data);
                        const priorityEntries = entries.filter(([k]) => priorityKeys.includes(k));
                        const otherEntries = entries.filter(([k]) => !priorityKeys.includes(k));

                        return (
                          <div className="text-[10px] space-y-1.5 min-w-[200px]">
                            {priorityEntries.map(([key, value]) => (
                              <div key={key} className="flex justify-between gap-4 border-b border-border pb-1 last:border-0">
                                <span className="text-muted-foreground font-bold uppercase tracking-tighter">{key.replace(/_/g, ' ')}</span>
                                <span className="text-foreground font-mono font-bold bg-muted px-1.5 py-0.5 rounded-md">{String(value)}</span>
                              </div>
                            ))}
                            {otherEntries.length > 0 && (
                              <details className="group mt-2">
                                <summary className="cursor-pointer text-muted-foreground/40 hover:text-primary text-[9px] font-black uppercase tracking-[0.2em] select-none list-none flex items-center gap-1 transition-colors">
                                  <span className="group-open:rotate-90 transition-transform">▸</span> Raw Metadata
                                </summary>
                                <pre className="mt-2 p-3 bg-muted/50 rounded-lg border border-border text-[9px] text-muted-foreground overflow-x-auto max-w-[300px] scrollbar-thin shadow-inner font-mono">
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
          <div className="px-6 py-6 border-t border-border flex items-center justify-between bg-muted/10">
            <Link
              href={{ query: { ...params, page: Math.max(1, page - 1) } }}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all ${page === 1 ? 'pointer-events-none opacity-30' : ''}`}
            >
              Previous
            </Link>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Page {page} / {totalPages}
            </span>
            <Link
              href={{ query: { ...params, page: Math.min(totalPages, page + 1) } }}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all ${page === totalPages ? 'pointer-events-none opacity-30' : ''}`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
