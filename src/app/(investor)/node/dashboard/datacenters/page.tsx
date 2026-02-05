
import { Database, MapPin, CheckCircle, Server, Shield } from "lucide-react";
import { COMPANY_CONFIG } from "@/lib/config/company";

export const metadata = {
  title: "Data Centers",
};

export default function DataCentersPage() {
  const dc = COMPANY_CONFIG.datacenters[0];
  const available = dc.capacity.total - dc.capacity.active;
  const utilization = ((dc.capacity.active / dc.capacity.total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-zinc-400" />
            Data Center Infrastructure
          </h1>
          <p className="text-zinc-400 mt-1">
            Physical locations where your Node assets are deployed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Active DC */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="h-48 bg-zinc-800 relative">
               {/* Placeholder for Map/Image */}
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent flex items-end p-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 text-green-400 border border-green-900/50 text-xs font-bold mb-2">
                        <CheckCircle className="w-3 h-3" /> LIVE & OPERATIONAL
                    </div>
                    <h2 className="text-3xl font-bold text-white">Okhla – Delhi (DC-DEL-01)</h2>
                  </div>
               </div>
            </div>
            
            <div className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Capacity</div>
                    <div className="text-xl font-bold text-white">{dc.capacity.total} Units</div>
                    <div className="text-xs text-zinc-600 mt-1">Rack Space</div>
                  </div>
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Active Nodes</div>
                    <div className="text-xl font-bold text-white">{dc.capacity.active} Units</div>
                    <div className="text-xs text-green-500 mt-1">{utilization}% Utilization</div>
                  </div>
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Available</div>
                    <div className="text-xl font-bold text-white">{available} Units</div>
                    <div className="text-xs text-zinc-600 mt-1">Ready for deployment</div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-zinc-400" />
                    Operational Status
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    The Okhla Data Center is currently operating at optimal efficiency. 
                    Power redundancy systems were tested on Oct 15, 2024. 
                    Network latency to major Indian ISPs remains below 5ms. 
                    Physical security audits are conducted quarterly.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Future / Planned */}
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-white px-1">Planned Expansion</h3>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 opacity-75">
                <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-600 italic">
                    Expansion plans are currently under review.
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
