"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Server, FileText, CheckCircle, AlertCircle, Clock, PauseCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { getNodesPageData } from "@/app/actions/admin-data";
import { NodeFilters } from "@/components/admin/node/NodeFilters";
import { NodeStatus, MoUStatus } from "@/types/node";

export default function NodesPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getNodesPageData>> | null>(null);
  const [loading, setLoading] = useState(true);

  const filters = {
    dcId: searchParams.get("dcId") || undefined,
    status: (searchParams.get("status") as NodeStatus) || undefined,
    mouStatus: (searchParams.get("mouStatus") as MoUStatus) || undefined,
    userId: searchParams.get("userId") || undefined,
  };

  useEffect(() => {
    setLoading(true);
    getNodesPageData(filters).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [searchParams]);

  if (loading || !data) {
     return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
        </div>
    );
  }

  const { nodes, dcs, users } = data;
  const dcMap = new Map(dcs.map(dc => [dc.id, dc]));
  const userMap = new Map(users.map(u => [u.identity.id, u]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Node Management</h1>
          <p className="text-zinc-400">Contractual participation and infrastructure allocation.</p>
        </div>
        <Link 
            href="/admin/nodes/create" 
            className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-zinc-200 transition-colors"
        >
            Create New Node
        </Link>
      </div>

      <NodeFilters dcs={dcs.map(d => ({ id: d.id, name: d.name }))} />

      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900 text-zinc-200 uppercase font-medium text-xs">
            <tr>
              <th className="px-6 py-3">Node ID</th>
              <th className="px-6 py-3">Participant</th>
              <th className="px-6 py-3">Data Center</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">MoU Status</th>
              <th className="px-6 py-3 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-black">
            {nodes.map((node) => {
              const dc = dcMap.get(node.infrastructure.dcId);
              const user = userMap.get(node.participant.userId);
              const participantName = user ? (user.identity.email || user.identity.phone) : node.participant.userId;

              return (
                <tr 
                  key={node.identity.id} 
                  className="group hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link href={`/admin/nodes/${node.identity.id}`} className="block">
                      <div className="font-medium text-white group-hover:text-white transition-colors flex items-center gap-2">
                        <Server className="w-4 h-4 text-zinc-500" />
                        {node.identity.id}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-300">{participantName}</div>
                    <div className="text-xs text-zinc-600 font-mono">{node.participant.userId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>{dc?.name || node.infrastructure.dcId}</div>
                    <div className="text-xs text-zinc-600">{node.infrastructure.pool}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={node.state.status} />
                  </td>
                  <td className="px-6 py-4">
                    <MoUBadge status={node.contract.mouStatus} />
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-500">
                    {new Date(node.identity.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
            {nodes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Server className="w-8 h-8 text-zinc-700" />
                    <p className="font-medium text-zinc-400">No Nodes Found</p>
                    <p className="text-sm text-zinc-600 mb-4 max-w-sm">
                      There are no participating nodes matching your criteria.
                    </p>
                    <Link 
                        href="/admin/nodes/create" 
                        className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-zinc-200 transition-colors"
                    >
                        Create First Node
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: NodeStatus }) {
  const styles = {
    pending: "text-zinc-400 bg-zinc-900 border-zinc-700",
    deploying: "text-blue-400 bg-blue-900/20 border-blue-900",
    active: "text-green-400 bg-green-900/20 border-green-900",
    paused: "text-amber-400 bg-amber-900/20 border-amber-900",
    retired: "text-red-400 bg-red-900/20 border-red-900",
  };
  
  const icons = {
    pending: Clock,
    deploying: Server,
    active: CheckCircle,
    paused: PauseCircle,
    retired: XCircle,
  };

  const Icon = icons[status];

  return (
    <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider font-bold flex items-center gap-1.5 w-fit ${styles[status]}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

function MoUBadge({ status }: { status: MoUStatus }) {
    const styles = {
      draft: "text-zinc-500",
      signed: "text-blue-400",
      active: "text-green-400",
      terminated: "text-red-400",
      pending: "text-amber-400",
      not_signed: "text-zinc-600",
    };
    return (
        <span className={`flex items-center gap-1.5 text-xs font-medium ${styles[status]}`}>
            <FileText className="w-3 h-3" />
            <span className="capitalize">{status.replace('_', ' ')}</span>
        </span>
    );
}
