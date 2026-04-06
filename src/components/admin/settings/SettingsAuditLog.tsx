
"use client";

import { SettingsAuditLog } from "@/types/settings";
import { useState } from "react";
import { FileText, Clock, Shield, Plug, Flag, Globe, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsAuditLogView({ logs }: { logs: SettingsAuditLog[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayLogs = showAll ? logs : logs.slice(0, 10);

  const getIcon = (section: SettingsAuditLog["section"]) => {
    switch (section) {
      case "auth": return <Shield className="w-4 h-4 text-primary" />;
      case "integrations": return <Plug className="w-4 h-4 text-accent" />;
      case "features": return <Flag className="w-4 h-4 text-warning" />;
      case "platform": return <Globe className="w-4 h-4 text-success" />;
      case "notifications": return <Bell className="w-4 h-4 text-warning" />;
      case "security": return <Shield className="w-4 h-4 text-destructive" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground/40" />;
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm group">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center border border-border shadow-inner text-muted-foreground/60">
            <FileText className="w-5 h-5" />
          </div>
          Audit Ledger
        </h3>
        <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">
            {logs.length} Sequential Records
        </span>
      </div>

      <div className="space-y-0 divide-y divide-border border border-border rounded-2xl bg-muted/20 overflow-hidden">
        {displayLogs.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 text-sm">No actions recorded yet.</div>
        ) : (
            displayLogs.map(log => (
                <div key={log.id} className="p-5 text-sm flex gap-5 hover:bg-muted/40 transition-colors group/log">
                    <div className={cn(
                      "mt-1 w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm",
                      log.section === 'security' ? 'bg-destructive/5 border-destructive/10' : 
                      log.section === 'auth' ? 'bg-primary/5 border-primary/10' : 'bg-muted border-border'
                    )}>
                      {getIcon(log.section)}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-4 mb-1.5">
                            <span className="text-[11px] font-black uppercase tracking-widest text-foreground group-hover/log:text-primary transition-colors">
                                {log.action.replace("_", " ")}
                            </span>
                            <span className="text-muted-foreground/30 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                <Clock className="w-3 h-3" />
                                {log.timestamp ? new Date(log.timestamp as string).toLocaleString() : "N/A"}
                            </span>
                        </div>
                        <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-tight truncate mb-1">
                            {log.details}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground/20 text-[9px] font-black uppercase tracking-widest bg-muted/40 px-1.5 py-0.5 rounded border border-border/50">
                              Admin: {log.adminId}
                          </span>
                          <span className="text-muted-foreground/20 text-[9px] font-black uppercase tracking-widest bg-muted/40 px-1.5 py-0.5 rounded border border-border/50">
                              Section: {log.section}
                          </span>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      {logs.length > 10 && (
        <button 
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-foreground transition-all text-center py-4 border border-dashed border-border rounded-2xl hover:bg-muted/30 active:scale-[0.99]"
        >
            {showAll ? "Consolidate Ledger" : `Expand Ledger (+${logs.length - 10} records)`}
        </button>
      )}
    </div>
  );
}
