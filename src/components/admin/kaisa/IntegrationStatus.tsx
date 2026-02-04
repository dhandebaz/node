
"use client";

import { KaisaIntegrationConfig } from "@/types/kaisa";
import { toggleIntegrationAction } from "@/app/actions/kaisa";
import { useState } from "react";
import { Link2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export function IntegrationStatus({ integrations }: { integrations: KaisaIntegrationConfig[] }) {
    const [loading, setLoading] = useState<string | null>(null);
  
    const handleToggle = async (name: string, current: boolean) => {
        if (!confirm(`Are you sure you want to ${current ? 'disable' : 'enable'} ${name} integration globally?`)) return;
        setLoading(name);
        await toggleIntegrationAction(name, !current);
        setLoading(null);
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
             <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-brand-blue" />
                <h3 className="font-medium text-white">System Integrations</h3>
            </div>
            <div className="divide-y divide-zinc-800">
                {integrations.map(int => (
                    <div key={int.name} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <StatusIcon status={int.status} />
                             <div>
                                 <div className="text-sm font-medium text-white">{int.name}</div>
                                 <div className="text-xs text-zinc-500 capitalize">{int.status}</div>
                             </div>
                        </div>
                        <button 
                            onClick={() => handleToggle(int.name, int.enabledGlobal)}
                            disabled={!!loading}
                            className={`text-xs uppercase font-bold px-2 py-1 rounded border ${
                                int.enabledGlobal 
                                    ? "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                                    : "bg-red-900/20 text-red-400 border-red-900"
                            }`}
                        >
                            {int.enabledGlobal ? "Enabled" : "Disabled"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatusIcon({ status }: { status: string }) {
    if (status === "active") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "issues") return <AlertCircle className="w-4 h-4 text-amber-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
}
