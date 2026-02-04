
import { dcService } from "@/lib/services/datacenterService";
import { DCControls } from "@/components/admin/datacenter/DCControls";
import { ArrowLeft, MapPin, Calendar, Server, Activity, Cpu } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DataCenterProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dc = await dcService.getById(id);
  const logs = await dcService.getAuditLogs(id);

  if (!dc) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/datacenters" 
          className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {dc.name}
            <StatusBadge status={dc.status} />
          </h1>
          <p className="text-zinc-400 text-sm font-mono">{dc.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Overview & Node Allocation */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-blue" />
              Facility Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Location" value={`${dc.location.city}, ${dc.location.state}, ${dc.location.country}`} icon={<MapPin className="w-4 h-4" />} />
              <InfoItem label="Go-Live Date" value={new Date(dc.goLiveDate).toLocaleDateString()} icon={<Calendar className="w-4 h-4" />} />
              <InfoItem label="Power Profile" value={dc.infrastructure.powerProfile} />
              <InfoItem label="Cooling Profile" value={dc.infrastructure.coolingProfile} />
              <InfoItem label="Network Profile" value={dc.infrastructure.networkProfile} />
            </div>
          </div>

          {/* Node Allocation */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-blue" />
              Node Allocation
            </h2>
            
            <div className="border border-zinc-800 rounded overflow-hidden">
               <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-950 text-zinc-500 font-medium text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2">Unit ID</th>
                      <th className="px-4 py-2">Participant</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {/* Mock Node List - In real app, fetch from NodeService */}
                    {Array.from({ length: dc.capacity.active }).map((_, i) => (
                      <tr key={i} className="hover:bg-zinc-900/50">
                        <td className="px-4 py-2 font-mono text-zinc-300">ND-{dc.id.split('-')[1]}-{100 + i}</td>
                        <td className="px-4 py-2">USR-{(Math.random() * 1000).toFixed(0).padStart(3, '0')}</td>
                        <td className="px-4 py-2"><span className="text-green-400 text-xs uppercase font-bold">Online</span></td>
                      </tr>
                    ))}
                    {dc.capacity.active === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-zinc-600">No active nodes deployed.</td>
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
               {logs.length === 0 ? (
                 <div className="p-4 text-center text-zinc-500 text-sm">No recorded actions.</div>
               ) : (
                 logs.map((log) => (
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

        {/* Right Column: Controls */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <DCControls dc={dc} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-zinc-200 font-medium">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-900/30 text-green-400 border-green-900",
    planned: "bg-blue-900/30 text-blue-400 border-blue-900",
    retired: "bg-red-900/30 text-red-400 border-red-900",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider font-bold ${styles[status] || "bg-zinc-800"}`}>
      {status}
    </span>
  );
}
