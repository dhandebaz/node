
"use client";

import { SpaceServiceProfile } from "@/types/space";
import { updateServiceStatusAction, updateResourceLimitsAction } from "@/app/actions/space";
import { useState } from "react";
import { 
  Server, 
  Globe, 
  HardDrive, 
  Activity, 
  AlertTriangle, 
  Play, 
  Pause,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export function SpaceServiceControl({ service }: { service: SpaceServiceProfile }) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: SpaceServiceProfile["status"]) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus.toUpperCase()}?`)) return;
    setLoading(true);
    await updateServiceStatusAction(service.id, newStatus);
    setLoading(false);
  };

  const handleLimitChange = async (key: string, delta: number) => {
    // @ts-ignore
    const current = service.limits[key] || 0;
    const next = current + delta;
    if (next < 0) return;

    if (!confirm(`Change ${key} from ${current} to ${next}?`)) return;

    setLoading(true);
    await updateResourceLimitsAction(service.id, { [key]: next });
    setLoading(false);
  };

  const isSuspended = service.status === "suspended";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            service.type === "CDN" ? "bg-amber-900/20 text-amber-400" : 
            service.type === "Dedicated" ? "bg-purple-900/20 text-purple-400" : 
            "bg-blue-900/20 text-blue-400"
          }`}>
            {service.type === "CDN" ? <Globe className="w-5 h-5" /> : <Server className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-medium text-white">{service.planName}</h4>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
              <span>{service.id}</span>
              <span>•</span>
              <span>{service.dataCenterId}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider font-bold ${
                service.status === "active" ? "bg-green-900/30 text-green-400 border-green-900" : 
                service.status === "suspended" ? "bg-red-900/30 text-red-400 border-red-900" :
                "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}>
                {service.status}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/30 rounded p-3 mb-4">
        {/* Resource Limits Display & Controls */}
        {service.limits.storageGB !== undefined && (
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <HardDrive className="w-4 h-4" />
                    <span>Storage: <span className="text-white font-mono">{service.limits.storageGB} GB</span></span>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => handleLimitChange("storageGB", 10)} disabled={loading} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-green-400"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => handleLimitChange("storageGB", -10)} disabled={loading} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400"><ArrowDown className="w-3 h-3" /></button>
                </div>
             </div>
        )}
        
        {service.limits.bandwidthGB !== undefined && (
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Activity className="w-4 h-4" />
                    <span>Bandwidth: <span className="text-white font-mono">{service.limits.bandwidthGB} GB</span></span>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => handleLimitChange("bandwidthGB", 100)} disabled={loading} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-green-400"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => handleLimitChange("bandwidthGB", -100)} disabled={loading} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400"><ArrowDown className="w-3 h-3" /></button>
                </div>
             </div>
        )}

        {service.limits.vCPU !== undefined && (
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Server className="w-4 h-4" />
                    <span>vCPU: <span className="text-white font-mono">{service.limits.vCPU} Cores</span></span>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => handleLimitChange("vCPU", 1)} disabled={loading} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-green-400"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => handleLimitChange("vCPU", -1)} disabled={loading} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400"><ArrowDown className="w-3 h-3" /></button>
                </div>
             </div>
        )}
      </div>

      <div className="flex justify-end pt-3 border-t border-zinc-800">
        {isSuspended ? (
            <button 
                onClick={() => handleStatusChange("active")}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-900/20 text-green-400 hover:bg-green-900/40 border border-green-900 rounded text-xs font-medium transition-colors"
            >
                <Play className="w-3 h-3" /> Resume Service
            </button>
        ) : (
            <button 
                onClick={() => handleStatusChange("suspended")}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900 rounded text-xs font-medium transition-colors"
            >
                <AlertTriangle className="w-3 h-3" /> Suspend Service
            </button>
        )}
      </div>
    </div>
  );
}
