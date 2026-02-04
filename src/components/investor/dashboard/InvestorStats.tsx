
"use client";

import { InvestorDashboardStats } from "@/types/investor";
import { Server, Zap, Database, Clock } from "lucide-react";

export function InvestorStats({ stats }: { stats: InvestorDashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-900/20 rounded-md">
            <Server className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-zinc-400">Total Nodes</span>
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.totalNodes}</span>
            <span className="text-xs text-zinc-500">units owned</span>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-900/20 rounded-md">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <span className="text-sm font-medium text-zinc-400">Active / Deploying</span>
        </div>
         <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.activeNodes}</span>
            <span className="text-sm text-zinc-500">/ {stats.deployingNodes}</span>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-900/20 rounded-md">
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-sm font-medium text-zinc-400">Data Centers</span>
        </div>
        <div className="text-xl font-bold text-white truncate" title={stats.dataCenters.join(", ")}>
          {stats.dataCenters.length > 0 ? stats.dataCenters[0] : "None"}
          {stats.dataCenters.length > 1 && <span className="text-xs font-normal text-zinc-500 ml-1">+{stats.dataCenters.length - 1} more</span>}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-zinc-800 rounded-md">
            <Clock className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="text-sm font-medium text-zinc-400">Next Report</span>
        </div>
        <div className="text-xl font-bold text-white">
          {new Date(stats.nextReportDate).toLocaleDateString("en-IN", { month: 'short', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
}
