
import { SpaceStats } from "@/types/space";
import { Server, Users, Activity, Globe } from "lucide-react";

export function SpaceOverview({ stats }: { stats: SpaceStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-900/20 rounded-lg">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-zinc-400 text-sm font-medium">Total Customers</span>
        </div>
        <div className="text-2xl font-bold text-white">{stats.totalCustomers}</div>
      </div>

      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-900/20 rounded-lg">
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <span className="text-zinc-400 text-sm font-medium">Active Services</span>
        </div>
        <div className="text-2xl font-bold text-white">{stats.activeServices}</div>
        <div className="text-xs text-zinc-500 mt-1">
          {stats.suspendedServices} Suspended
        </div>
      </div>

      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-900/20 rounded-lg">
            <Server className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-zinc-400 text-sm font-medium">Infrastructure</span>
        </div>
        <div className="flex justify-between items-end">
            <div>
                <div className="text-xl font-bold text-white">{stats.byType.Dedicated}</div>
                <div className="text-xs text-zinc-500">Dedicated</div>
            </div>
            <div className="text-right">
                <div className="text-xl font-bold text-white">{stats.byType.Shared}</div>
                <div className="text-xs text-zinc-500">Shared</div>
            </div>
        </div>
      </div>

      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-900/20 rounded-lg">
            <Globe className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-zinc-400 text-sm font-medium">CDN Users</span>
        </div>
        <div className="text-2xl font-bold text-white">{stats.cdnEnabledCount}</div>
      </div>
    </div>
  );
}
