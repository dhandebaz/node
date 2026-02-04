
"use client";

import { KaisaModuleConfig, KaisaModuleType, KaisaBusinessType } from "@/types/kaisa";
import { toggleModuleAction } from "@/app/actions/kaisa";
import { useState } from "react";
import { Loader2, Power, Layers } from "lucide-react";

export function CapabilitiesControl({ modules }: { modules: KaisaModuleConfig[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (type: KaisaModuleType, current: boolean, types?: KaisaBusinessType[]) => {
    if (!confirm(`Are you sure you want to ${current ? 'disable' : 'enable'} ${type}?`)) return;
    
    setLoading(type);
    await toggleModuleAction(type, !current, types);
    setLoading(null);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
        <Layers className="w-5 h-5 text-brand-blue" />
        <h3 className="font-medium text-white">Capabilities Control</h3>
      </div>
      
      <div className="divide-y divide-zinc-800">
        {modules.map((mod) => (
          <div key={mod.type} className="p-4 flex items-center justify-between hover:bg-zinc-900/50">
            <div>
              <div className="font-medium text-white flex items-center gap-2">
                {mod.type}
                {!mod.enabledGlobal && <span className="text-xs bg-red-900/30 text-red-400 px-1.5 rounded border border-red-900">DISABLED</span>}
              </div>
              <div className="text-xs text-zinc-500 mt-1 flex gap-2">
                {mod.enabledFor.length === 4 ? "All Business Types" : mod.enabledFor.join(", ")}
              </div>
            </div>

            <button
              onClick={() => handleToggle(mod.type, mod.enabledGlobal, mod.enabledFor)}
              disabled={!!loading}
              className={`p-2 rounded transition-colors ${
                mod.enabledGlobal 
                  ? "bg-green-900/20 text-green-400 hover:bg-green-900/40" 
                  : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
              }`}
            >
              {loading === mod.type ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
