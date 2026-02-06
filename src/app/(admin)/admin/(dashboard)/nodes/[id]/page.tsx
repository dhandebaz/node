
"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { NodeControls } from "@/components/admin/node/NodeControls";
import { ArrowLeft, Server, Calendar, User, FileText, Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import { NodeStatus } from "@/types/node";
import { getNodeDetailData } from "@/app/actions/admin-data";

export default function NodeProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [data, setData] = useState<Awaited<ReturnType<typeof getNodeDetailData>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    getNodeDetailData(id).then((res) => {
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

  if (!data || !data.node) {
    return notFound();
  }

  const { node, dc, user, logs } = data;
  const participantName = user ? (user.identity.email || user.identity.phone) : node.participant.userId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/nodes" 
          className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {node.identity.id}
            <StatusBadge status={node.state.status} />
          </h1>
          <p className="text-zinc-400 text-sm font-mono">
             Created: {new Date(node.identity.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-white" />
              Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem 
                label="Participant" 
                value={participantName} 
                subValue={node.participant.userId}
                icon={<User className="w-4 h-4" />} 
                link={`/admin/users/${node.participant.userId}`}
              />
              <InfoItem 
                label="Data Center" 
                value={dc?.name || node.infrastructure.dcId} 
                subValue={node.infrastructure.pool}
                icon={<Server className="w-4 h-4" />} 
                link={`/admin/datacenters/${node.infrastructure.dcId}`}
              />
              <InfoItem 
                label="Unit Value" 
                value={`₹${node.identity.unitValue.toLocaleString()}`} 
              />
              <InfoItem 
                label="Contract Status" 
                value={node.contract.mouStatus.toUpperCase()} 
                subValue={node.contract.mouRefId || "No Reference"}
                icon={<FileText className="w-4 h-4" />} 
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white" />
              Lifecycle Timeline
            </h2>
            
            <div className="relative pl-4 border-l border-zinc-800 space-y-6">
               <TimelineItem 
                 date={node.identity.createdAt} 
                 label="Created" 
                 status="completed" 
               />
               <TimelineItem 
                 date={node.contract.signedDate} 
                 label="MoU Signed" 
                 status={node.contract.signedDate ? "completed" : "pending"} 
               />
               <TimelineItem 
                 date={node.state.activationDate} 
                 label="Activated" 
                 status={node.state.activationDate ? "completed" : "pending"} 
               />
               <TimelineItem 
                 date={node.state.holdPeriodEnd} 
                 label="Hold Period Ends" 
                 status={node.state.holdPeriodEnd ? (new Date(node.state.holdPeriodEnd) < new Date() ? "completed" : "future") : "pending"} 
                 isFuture={true}
               />
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
             <h3 className="text-lg font-medium text-white mb-4">Audit Log</h3>
             <div className="space-y-0 divide-y divide-zinc-800 border border-zinc-800 rounded bg-zinc-950 max-h-60 overflow-y-auto">
               {logs.length === 0 ? (
                 <div className="p-4 text-center text-zinc-500 text-sm">No recorded actions.</div>
               ) : (
                 logs.map((log) => (
                   <div key={log.id} className="p-3 text-sm flex justify-between items-start hover:bg-zinc-900/50">
                     <div>
                       <span className="block text-zinc-300 font-medium capitalize mb-0.5">{log.actionType.replace(/_/g, " ")}</span>
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

        {/* Right Column: Controls */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <NodeControls node={node} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, subValue, icon, link }: { label: string, value: string, subValue?: string, icon?: React.ReactNode, link?: string }) {
  const content = (
    <div>
      <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-zinc-200 font-medium">
        {value}
      </p>
      {subValue && <p className="text-xs text-zinc-500 font-mono mt-0.5">{subValue}</p>}
    </div>
  );

  if (link) {
      return <Link href={link} className="block hover:bg-zinc-800/50 p-2 -m-2 rounded transition-colors">{content}</Link>;
  }
  return content;
}

function TimelineItem({ date, label, status, isFuture }: { date?: string, label: string, status: "completed" | "pending" | "future", isFuture?: boolean }) {
    const colors = {
        completed: "bg-green-500 border-green-900",
        pending: "bg-zinc-800 border-zinc-700",
        future: "bg-blue-500 border-blue-900"
    };

    return (
        <div className="relative">
            <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border ${colors[status]}`}></div>
            <div>
                <p className={`text-sm font-medium ${status === "pending" ? "text-zinc-500" : "text-zinc-200"}`}>{label}</p>
                {date && <p className="text-xs text-zinc-500 font-mono">{new Date(date).toLocaleDateString()}</p>}
                {!date && status === "pending" && <p className="text-xs text-zinc-600 italic">Not yet reached</p>}
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
    return (
      <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider font-bold ${styles[status]}`}>
        {status}
      </span>
    );
  }
