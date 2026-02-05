
"use client";

import { SecuritySettings } from "@/types/settings";
import { updateSecurityAction, forceLogoutAllAction } from "@/app/actions/settings";
import { useState } from "react";
import { ShieldAlert, LogOut, Clock, Lock, AlertTriangle } from "lucide-react";

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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="font-medium text-white flex items-center gap-2 mb-6">
        <ShieldAlert className="w-5 h-5 text-red-400" />
        Security Controls
      </h3>

      <div className="space-y-6">
        
        {/* Session Timeout */}
        <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
                <label className="text-xs text-zinc-400 font-medium uppercase flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Session Timeout (Minutes)
                </label>
                <input 
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(parseInt(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
            </div>
            <button
                onClick={handleTimeoutSave}
                disabled={loading || timeout === settings.sessionTimeoutMinutes}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
            >
                Update
            </button>
        </div>

        <div className="border-t border-zinc-800 pt-6 space-y-4">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Danger Zone
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={toggleAdminLock}
                    disabled={loading}
                    className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors ${
                        settings.adminAccessLocked
                        ? "bg-red-900/20 border-red-900 text-red-400 hover:bg-red-900/30"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-red-900 hover:text-red-400"
                    }`}
                >
                    <Lock className="w-6 h-6" />
                    <span className="font-bold text-sm">
                        {settings.adminAccessLocked ? "Unlock Admin Access" : "Lock Admin Access"}
                    </span>
                </button>

                <button
                    onClick={handleForceLogout}
                    disabled={loading}
                    className="p-4 rounded-lg border bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-red-900 hover:text-red-400 hover:bg-red-900/10 flex flex-col items-center justify-center gap-2 transition-colors"
                >
                    <LogOut className="w-6 h-6" />
                    <span className="font-bold text-sm">Force Logout All Sessions</span>
                </button>
            </div>
            {settings.forceLogoutTriggeredAt && (
                <div className="text-center text-xs text-zinc-500">
                    Last forced logout: {new Date(settings.forceLogoutTriggeredAt).toLocaleString()}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
