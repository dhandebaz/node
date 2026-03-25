
"use client";

import { SecuritySettings } from "@/types/settings";
import { updateSecurityAction, forceLogoutAllAction } from "@/app/actions/settings";
import { useState } from "react";
import { ShieldAlert, LogOut, Clock, Lock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function SecuritySettingsPanel({ settings }: { settings: SecuritySettings }) {
  const [loading, setLoading] = useState(false);
  const [timeout, setTimeout] = useState(settings.sessionTimeoutMinutes);

  const handleTimeoutSave = async () => {
    setLoading(true);
    await updateSecurityAction({ sessionTimeoutMinutes: timeout });
    setLoading(false);
  };

  const toggleAdminLock = async () => {
    if (!confirm(`Are you sure you want to ${settings.adminAccessLocked ? "UNLOCK" : "LOCK"} Admin Access?`)) return;
    setLoading(true);
    await updateSecurityAction({ adminAccessLocked: !settings.adminAccessLocked });
    setLoading(false);
  };

  const handleForceLogout = async () => {
    if (!confirm("CRITICAL: This will log out ALL users immediately. Are you sure?")) return;
    setLoading(true);
    await forceLogoutAllAction();
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm group">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center border border-destructive/20 shadow-inner">
          <ShieldAlert className="w-5 h-5 text-destructive" />
        </div>
        Security Protocols
      </h3>

      <div className="space-y-6">
        
        {/* Session Timeout */}
        <div className="flex items-end gap-4 bg-muted/20 p-5 rounded-2xl border border-border/50">
            <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Session Validity Threshold (m)
                </label>
                <input 
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(parseInt(e.target.value))}
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono font-bold"
                />
            </div>
            <button
                onClick={handleTimeoutSave}
                disabled={loading || timeout === settings.sessionTimeoutMinutes}
                className="px-6 py-3 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md disabled:opacity-30 active:scale-95 mb-[3px]"
            >
                Commit
            </button>
        </div>

        <div className="pt-10 space-y-6">
            <h4 className="text-[10px] font-black text-destructive uppercase tracking-[0.3em] flex items-center gap-3 ml-2">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              Containment Protocols
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={toggleAdminLock}
                    disabled={loading}
                    className={cn(
                      "p-8 rounded-2xl border flex flex-col items-center justify-center gap-4 transition-all duration-300 active:scale-95 shadow-sm",
                      settings.adminAccessLocked
                      ? "bg-destructive text-destructive-foreground border-destructive shadow-lg shadow-destructive/20"
                      : "bg-muted/30 border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5"
                    )}
                >
                    <Lock className={cn("w-8 h-8", settings.adminAccessLocked ? "animate-bounce" : "")} />
                    <span className="font-black text-[10px] uppercase tracking-widest">
                        {settings.adminAccessLocked ? "Release Admin Lock" : "Engage Admin Lock"}
                    </span>
                </button>

                <button
                    onClick={handleForceLogout}
                    disabled={loading}
                    className="p-8 rounded-2xl border bg-muted/30 border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5 flex flex-col items-center justify-center gap-4 transition-all duration-300 active:scale-95 shadow-sm"
                >
                    <LogOut className="w-8 h-8" />
                    <span className="font-black text-[10px] uppercase tracking-widest">Global Session Evacuation</span>
                </button>
            </div>
            {settings.forceLogoutTriggeredAt && (
                <div className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-6">
                    Last Global Evacuation Triggered: {new Date(settings.forceLogoutTriggeredAt).toLocaleString()}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
