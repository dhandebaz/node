import { Users, Server, Zap, AlertTriangle, Activity } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 0; // Ensure fresh data

export default async function AdminDashboardPage() {
  // Fetch Stats in parallel
  const [
    { count: userCount },
    { count: nodeCount },
    { count: activeNodeCount },
    { data: dcs },
    { data: recentLogs }
  ] = await Promise.all([
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("nodes").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("nodes").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabaseAdmin.from("datacenters").select("total_capacity, active_nodes"),
    supabaseAdmin.from("admin_audit_logs").select("*").order("timestamp", { ascending: false }).limit(5)
  ]);

  // Calculate Capacity
  const totalCapacity = dcs?.reduce((acc, dc) => acc + dc.total_capacity, 0) || 0;
  const totalActiveNodes = dcs?.reduce((acc, dc) => acc + dc.active_nodes, 0) || 0;
  const capacityUsage = totalCapacity > 0 ? Math.round((totalActiveNodes / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-zinc-400">System status and key metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={userCount || 0} change="Live" icon={Users} />
        <StatCard title="Active Nodes" value={activeNodeCount || 0} change={`${nodeCount || 0} Total`} icon={Server} />
        <StatCard title="Capacity Usage" value={`${capacityUsage}%`} change={`${totalActiveNodes}/${totalCapacity} Slots`} icon={Zap} />
        <StatCard title="Recent Actions" value={recentLogs?.length || 0} change="Last 24h" icon={Activity} />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-0">
          {(!recentLogs || recentLogs.length === 0) ? (
             <div className="text-zinc-500 text-sm py-4">No recent activity recorded.</div>
          ) : (
            recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                        <div className="text-zinc-300 text-sm font-medium">
                            <span className="capitalize">{log.action_type.replace(/_/g, " ")}</span>
                            <span className="text-zinc-500 mx-1">on</span>
                            <span className="uppercase text-xs font-mono bg-zinc-800 px-1 rounded">{log.target_resource}</span>
                        </div>
                        <div className="text-zinc-500 text-xs mt-0.5">{log.details}</div>
                    </div>
                  </div>
                  <div className="text-right">
                      <div className="text-zinc-500 text-xs font-mono">{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div className="text-zinc-600 text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
            ))
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
            <Link href="/admin/logs" className="text-sm text-zinc-400 hover:text-white transition-colors">
                View All Activity
            </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, isAlert }: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-400 text-sm font-medium">{title}</span>
        <Icon className={`w-4 h-4 ${isAlert ? "text-red-500" : "text-zinc-500"}`} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className={`text-xs mt-1 text-zinc-500`}>
        {change}
      </div>
    </div>
  );
}
