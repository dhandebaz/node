
import { getInvestorNodeDetail } from "@/app/actions/investor";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Server, MapPin, FileText, Activity, Clock } from "lucide-react";

export const metadata = {
  title: "Node Details",
};

export default async function NodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const node = await getInvestorNodeDetail(id);

  if (!node) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link 
        href="/node/dashboard/nodes"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Nodes
      </Link>

      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Server className="w-6 h-6 text-zinc-400" />
                {node.id}
            </h1>
            <p className="text-zinc-400 mt-1 font-mono text-sm">
                Unit Value: ₹{node.unitValue.toLocaleString('en-IN')}
            </p>
        </div>
        <div className="text-right">
             <div className="text-sm text-zinc-400 mb-1">Current Status</div>
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-white text-sm font-medium capitalize">
                <Activity className="w-4 h-4 text-green-400" />
                {node.status}
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
            {/* Infrastructure Mapping */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-zinc-400" />
                    Infrastructure Mapping
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Data Center</div>
                        <div className="text-white font-medium">{node.dataCenterName}</div>
                    </div>
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Physical Location</div>
                        <div className="text-white font-medium">{node.infrastructure.location}</div>
                    </div>
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Resource Pool</div>
                        <div className="text-white font-medium">{node.infrastructure.pool}</div>
                    </div>
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Lock-in Period End</div>
                        <div className="text-white font-medium">
                            {node.holdPeriodEnd ? new Date(node.holdPeriodEnd).toLocaleDateString() : "N/A"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Deployment Timeline */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-zinc-400" />
                    Deployment Timeline
                </h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:w-0.5 before:-translate-x-px before:bg-zinc-800 before:h-full before:content-['']">
                    {node.deploymentTimeline.map((event, index) => (
                        <div key={index} className="relative pl-8">
                            <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-2 border-zinc-900 bg-zinc-700 ring-4 ring-zinc-900" />
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                                <span className="text-sm font-bold text-white">{event.event}</span>
                                <span className="text-xs text-zinc-500 font-mono">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-zinc-400">
                                {event.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Contract & Notes */}
        <div className="space-y-6">
             <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-zinc-400" />
                    Contract Status
                </h3>
                <div className="space-y-4">
                     <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                        <span className="text-zinc-400 text-sm">MoU Status</span>
                        <span className="text-white text-sm font-medium capitalize">{node.contractStatus}</span>
                     </div>
                     <div className="pt-2">
                        <Link 
                            href="/node/dashboard/documents"
                            className="block w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-center rounded text-sm font-medium transition-colors"
                        >
                            View Signed MoU
                        </Link>
                     </div>
                </div>
             </div>

             <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">
                    Admin Notes
                </h3>
                <div className="p-4 bg-zinc-950 rounded border border-zinc-800 text-sm text-zinc-300 italic">
                    "{node.adminNotes}"
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
