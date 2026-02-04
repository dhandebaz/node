
"use client";

import { SettingsAuditLog } from "@/types/settings";
import { useState } from "react";
import { FileText, Clock, Shield, Plug, Flag, Globe, Bell } from "lucide-react";

export function SettingsAuditLogView({ logs }: { logs: SettingsAuditLog[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayLogs = showAll ? logs : logs.slice(0, 10);

  const getIcon = (section: SettingsAuditLog["section"]) => {
    switch (section) {
      case "auth": return <Shield className="w-4 h-4 text-blue-500" />;
      case "integrations": return <Plug className="w-4 h-4 text-purple-500" />;
      case "features": return <Flag className="w-4 h-4 text-amber-500" />;
      case "platform": return <Globe className="w-4 h-4 text-green-500" />;
      case "notifications": return <Bell className="w-4 h-4 text-yellow-500" />;
      case "security": return <Shield className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-zinc-400" />
          Settings Audit Trail
        </h3>
        <span className="text-xs text-zinc-500 font-mono">
            {logs.length} Total Records
        </span>
      </div>

      <div className="space-y-0 divide-y divide-zinc-800 border border-zinc-800 rounded bg-zinc-950/50">
        {displayLogs.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 text-sm">No actions recorded yet.</div>
        ) : (
            displayLogs.map(log => (
                <div key={log.id} className="p-3 text-sm flex gap-3 hover:bg-zinc-900/30 transition-colors">
                    <div className="mt-0.5">{getIcon(log.section)}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium text-zinc-300 capitalize">
                                {log.action.replace("_", " ")}
                            </span>
                            <span className="text-zinc-600 text-xs flex items-center gap-1 whitespace-nowrap">
                                <Clock className="w-3 h-3" />
                                {new Date(log.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-zinc-500 text-xs truncate">
                            {log.details}
                        </p>
                        <p className="text-zinc-700 text-[10px] font-mono mt-0.5 uppercase">
                            Admin: {log.adminId} • Section: {log.section}
                        </p>
                    </div>
                </div>
            ))
        )}
      </div>

      {logs.length > 10 && (
        <button 
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-4 text-xs text-zinc-500 hover:text-white transition-colors text-center py-2 border border-zinc-800/0 hover:border-zinc-800 rounded"
        >
            {showAll ? "Show Less" : `Show All (${logs.length - 10} more)`}
        </button>
      )}
    </div>
  );
}
