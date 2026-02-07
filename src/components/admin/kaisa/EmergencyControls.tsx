
"use client";

import { setSystemStatusAction } from "@/app/actions/kaisa";
import { useState } from "react";
import { AlertTriangle, Power } from "lucide-react";

export function EmergencyControls({ status }: { status: "operational" | "paused" }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const newStatus = status === "operational" ? "paused" : "operational";
    const action = newStatus === "paused" ? "PAUSE GLOBAL OPERATIONS" : "RESUME OPERATIONS";
    
    if (!confirm(`EMERGENCY ACTION: Are you sure you want to ${action}?`)) return;
    
    setLoading(true);
    await setSystemStatusAction(newStatus);
    setLoading(false);
  };

  return (
    <div className={`border rounded-lg p-6 ${
        status === "operational" 
            ? "bg-zinc-900 border-zinc-800" 
            : "bg-red-950/30 border-red-900"
    }`}>
      <div className="flex items-center justify-between">
        <div>
           <h3 className={`font-bold flex items-center gap-2 ${
               status === "operational" ? "text-white" : "text-red-500"
           }`}>
               <AlertTriangle className="w-5 h-5" />
               Emergency Controls
           </h3>
           <p className="text-sm text-zinc-400 mt-1">
               {status === "operational" 
                   ? "System is running normally." 
                   : "SYSTEM IS GLOBALLY PAUSED. Nodebase Core is unavailable to all users."}
           </p>
        </div>
        
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-4 py-2 rounded font-bold uppercase text-sm border flex items-center gap-2 transition-colors ${
                status === "operational"
                    ? "bg-red-600 text-white border-red-500 hover:bg-red-700"
                    : "bg-green-600 text-white border-green-500 hover:bg-green-700"
            }`}
        >
            <Power className="w-4 h-4" />
            {status === "operational" ? "Pause Globally" : "Resume Operations"}
        </button>
      </div>
    </div>
  );
}
