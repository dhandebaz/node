
"use client";

import { KaisaStats } from "@/types/kaisa";
import { Users, UserCheck, UserMinus, Briefcase, Crown } from "lucide-react";

export function KaisaOverview({ stats }: { stats: KaisaStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-silver/10 rounded text-brand-silver">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-zinc-400 text-sm font-medium">Total Users</span>
        </div>
        <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-cyan/10 rounded text-brand-cyan">
            <UserCheck className="w-4 h-4" />
          </div>
          <span className="text-zinc-400 text-sm font-medium">Active</span>
        </div>
        <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
        <div className="text-xs text-zinc-600 mt-1">vs {stats.pausedUsers} paused</div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-bone/10 rounded text-brand-bone">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="text-zinc-400 text-sm font-medium">Top Segment</span>
        </div>
        <div className="text-2xl font-bold text-white capitalize">
            {Object.entries(stats.byType).sort((a,b) => b[1] - a[1])[0]?.[0] || "N/A"}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-zinc-800 rounded text-zinc-400">
            <Crown className="w-4 h-4" />
          </div>
          <span className="text-zinc-400 text-sm font-medium">Role Split</span>
        </div>
        <div className="text-sm text-zinc-300 space-y-1">
          <div className="flex justify-between">
            <span>Managers</span>
            <span className="font-mono">{stats.byRole.manager}</span>
          </div>
          <div className="flex justify-between">
            <span>Co-founders</span>
            <span className="font-mono">{stats.byRole["co-founder"]}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
