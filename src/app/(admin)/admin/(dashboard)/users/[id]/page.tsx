
"use client";

export const dynamic = 'force-dynamic';


import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { getUserDetailData } from "@/app/actions/admin-data";
import { AdminControls } from "@/components/admin/user/AdminControls";
import { KaisaStatusControl } from "@/components/admin/user/KaisaStatusControl";
import { User, AuditLog } from "@/types/user";
import { ArrowLeft, User as UserIcon, Calendar, Phone, Mail, Box, Loader2 } from "lucide-react";
import Link from "next/link";

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

  const { user, auditLogs } = data;

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

          {/* Audit Logs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
             <h3 className="text-lg font-medium text-white mb-4">Audit Log</h3>
             <div className="space-y-0 divide-y divide-zinc-800 border border-zinc-800 rounded bg-zinc-950 max-h-60 overflow-y-auto">
               {auditLogs.length === 0 ? (
                 <div className="p-4 text-center text-zinc-500 text-sm">No recorded actions.</div>
               ) : (
                 auditLogs.map((log: AuditLog) => (
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
