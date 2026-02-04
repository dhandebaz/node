
"use client";

import { InvestorNodeSummary } from "@/types/investor";
import Link from "next/link";
import { ChevronRight, Server, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "active":
      return <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-900/20 text-green-400 border border-green-900/50 text-xs font-medium"><CheckCircle className="w-3 h-3" /> Active</span>;
    case "deploying":
      return <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-900/20 text-blue-400 border border-blue-900/50 text-xs font-medium"><Clock className="w-3 h-3" /> Deploying</span>;
    case "pending":
      return <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-900/20 text-yellow-400 border border-yellow-900/50 text-xs font-medium"><Clock className="w-3 h-3" /> Pending</span>;
    default:
      return <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-medium"><AlertTriangle className="w-3 h-3" /> {status}</span>;
  }
};

export function NodeList({ nodes }: { nodes: InvestorNodeSummary[] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Node ID</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Data Center</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Unit Value</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Activation</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {nodes.map((node) => (
              <tr key={node.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded border border-zinc-700">
                      <Server className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="font-medium text-white font-mono text-sm">{node.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-300">
                  {node.dataCenterName}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={node.status} />
                </td>
                <td className="px-6 py-4 text-sm text-zinc-300 font-mono">
                  ₹{node.unitValue.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">
                  {node.activationDate ? new Date(node.activationDate).toLocaleDateString() : "Pending"}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/node/dashboard/nodes/${node.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {nodes.length === 0 && (
        <div className="p-8 text-center text-zinc-500">
          No nodes found in your portfolio.
        </div>
      )}
    </div>
  );
}
