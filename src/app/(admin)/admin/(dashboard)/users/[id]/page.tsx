
"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { getUserDetailData } from "@/app/actions/admin-data";
import { AdminControls } from "@/components/admin/user/AdminControls";
import { KaisaStatusControl } from "@/components/admin/user/KaisaStatusControl";
import { SpaceServiceControl } from "@/components/admin/space/SpaceServiceControl";
import { User, KaisaProfile, SpaceProfile, NodeProfile } from "@/types/user";
import { ArrowLeft, User as UserIcon, Calendar, Phone, Mail, Box, Server, Cpu, Loader2 } from "lucide-react";
import Link from "next/link";
import { NodeStatus } from "@/types/node";

export default function UserProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [data, setData] = useState<Awaited<ReturnType<typeof getUserDetailData>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    getUserDetailData(id).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!data || !data.user) {
    return notFound();
  }

  const { user, auditLogs, nodes, spaceServices } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/users" 
          className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {user.identity.id}
            <StatusBadge status={user.status.account} />
          </h1>
          <p className="text-zinc-400 text-sm">Created on {new Date(user.identity.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Info & Products */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Identity Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-white" />
              Identity & Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Mobile Number" value={user.identity.phone} icon={<Phone className="w-4 h-4" />} />
              <InfoItem label="Email Address" value={user.identity.email || "Not provided"} icon={<Mail className="w-4 h-4" />} />
              <InfoItem label="User ID" value={user.identity.id} copyable />
              <InfoItem label="Last Activity" value={new Date(user.metadata.lastActivity).toLocaleString()} icon={<Calendar className="w-4 h-4" />} />
            </div>
          </div>

          {/* Product Associations */}
          <h2 className="text-lg font-medium text-white pt-2">Product Associations</h2>
          
          {/* Kaisa Profile */}
          {user.roles.isKaisaUser && user.products.kaisa ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Box className="w-24 h-24 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-blue-400 mb-4 flex items-center gap-2">
                kaisa AI
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                <InfoItem label="Business Type" value={user.products.kaisa.businessType} />
                <InfoItem label="Role" value={user.products.kaisa.role} capitalize />
                <InfoItem 
                  label="Active Modules" 
                  value={user.products.kaisa.activeModules.join(", ") || "None"} 
                />
              </div>
              <div className="relative z-10">
                <KaisaStatusControl user={user} />
              </div>
            </div>
          ) : (
            <EmptyProductCard name="kaisa AI" />
          )}

          {/* Space Profile */}
          {user.roles.isSpaceUser ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Server className="w-24 h-24 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium text-purple-400 mb-4 flex items-center gap-2">
                Nodebase Space
              </h3>
              <div className="relative z-10">
                {spaceServices.length > 0 ? (
                    <div className="space-y-4">
                        {spaceServices.map(service => (
                            <SpaceServiceControl key={service.id} service={service} />
                        ))}
                    </div>
                ) : (
                    <div className="text-zinc-500 text-sm border border-zinc-800 rounded p-4 bg-black/20 text-center">
                        User has 'isSpaceUser' role but no active services found.
                    </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyProductCard name="Nodebase Space" />
          )}

          {/* Node Profile & Participating Nodes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-lg font-medium text-orange-400 flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    Participating Nodes
                </h3>
                {user.roles.isNodeParticipant && (
                    <Link href="/admin/nodes/create" className="text-xs text-white hover:underline">
                        Allocate New Node
                    </Link>
                )}
            </div>

            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Cpu className="w-24 h-24 text-orange-500" />
            </div>

            {/* Summary if user is a participant */}
            {user.roles.isNodeParticipant && user.products.node && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 mb-6 border-b border-zinc-800 pb-6">
                    <InfoItem label="Units Owned" value={user.products.node.nodeUnits.toString()} />
                    <InfoItem label="MoU Status" value={user.products.node.mouStatus.replace("_", " ")} capitalize />
                    <InfoItem label="Data Center" value={user.products.node.dataCenterMapped || "Pending Allocation"} />
                </div>
            )}

            {/* Nodes Table */}
            <div className="border border-zinc-800 rounded overflow-hidden relative z-10 bg-zinc-950/50">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-950 text-zinc-500 font-medium text-xs uppercase">
                        <tr>
                            <th className="px-4 py-2">Node ID</th>
                            <th className="px-4 py-2">Data Center</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {nodes.map(node => (
                            <tr key={node.identity.id} className="hover:bg-zinc-900/50">
                                <td className="px-4 py-2 font-mono text-white">{node.identity.id}</td>
                                <td className="px-4 py-2">{node.infrastructure.dcId}</td>
                                <td className="px-4 py-2">
                                    <NodeStatusBadge status={node.state.status} />
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <Link href={`/admin/nodes/${node.identity.id}`} className="text-white hover:text-blue-400 text-xs font-medium">
                                        Manage
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {nodes.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-zinc-600">
                                    {user.roles.isNodeParticipant ? "User has no allocated nodes." : "User is not a node participant."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
             <h3 className="text-lg font-medium text-white mb-4">Audit Log</h3>
             <div className="space-y-0 divide-y divide-zinc-800 border border-zinc-800 rounded bg-zinc-950 max-h-60 overflow-y-auto">
               {auditLogs.length === 0 ? (
                 <div className="p-4 text-center text-zinc-500 text-sm">No recorded actions.</div>
               ) : (
                 auditLogs.map((log) => (
                   <div key={log.id} className="p-3 text-sm flex justify-between items-start hover:bg-zinc-900/50">
                     <div>
                       <span className="block text-zinc-300 font-medium capitalize mb-0.5">{log.actionType.replace("_", " ")}</span>
                       <span className="block text-zinc-500 text-xs">{log.details}</span>
                     </div>
                     <span className="text-zinc-600 text-xs whitespace-nowrap ml-4">
                       {new Date(log.timestamp).toLocaleDateString()}
                     </span>
                   </div>
                 ))
               )}
             </div>
          </div>

        </div>

        {/* Right Column: Admin Controls */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AdminControls user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon, copyable, capitalize }: { label: string, value: string, icon?: React.ReactNode, copyable?: boolean, capitalize?: boolean }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className={`text-zinc-200 font-medium ${capitalize ? "capitalize" : ""} ${copyable ? "font-mono text-sm" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function EmptyProductCard({ name }: { name: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-6 flex items-center justify-between opacity-50">
      <h3 className="text-zinc-500 font-medium">{name}</h3>
      <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-1 rounded">Not Active</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-900/30 text-green-400 border-green-900",
    suspended: "bg-red-900/30 text-red-400 border-red-900",
    blocked: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider font-bold ${styles[status] || "bg-zinc-800"}`}>
      {status}
    </span>
  );
}

function NodeStatusBadge({ status }: { status: NodeStatus }) {
  const styles = {
    pending: "text-zinc-500",
    deploying: "text-blue-400",
    active: "text-green-400",
    paused: "text-amber-400",
    retired: "text-red-400",
  };
  return (
    <span className={`text-xs uppercase font-bold ${styles[status]}`}>
      {status}
    </span>
  );
}
