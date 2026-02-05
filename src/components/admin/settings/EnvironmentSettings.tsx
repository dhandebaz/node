
"use client";

import { PlatformSettings } from "@/types/settings";
import { updatePlatformAction, updateSignupAction } from "@/app/actions/settings";
import { useState } from "react";
import { Globe, AlertOctagon, Eye, UserPlus } from "lucide-react";

export function EnvironmentSettingsPanel({ settings }: { settings: PlatformSettings }) {
  const [loading, setLoading] = useState(false);

  const toggleMode = async (mode: "maintenanceMode" | "readOnlyMode") => {
    const current = settings[mode];
    if (!confirm(`Are you sure you want to ${current ? "DISABLE" : "ENABLE"} ${mode === "maintenanceMode" ? "Maintenance Mode" : "Read-Only Mode"}? This will affect all users.`)) return;
    
    setLoading(true);
    await updatePlatformAction({ [mode]: !current });
    setLoading(false);
  };

  const toggleEnvironment = async () => {
    const isProduction = settings.environment === "production";
    const action = isProduction ? "Switch to MOCK" : "GO LIVE (Production)";
    if (!confirm(`Are you sure you want to ${action}? This will completely change the data source for all users.`)) return;

    setLoading(true);
    await updatePlatformAction({ environment: isProduction ? "mock" : "production" });
    setLoading(false);
  };

  const toggleSignup = async (product: keyof PlatformSettings["signupEnabled"]) => {
    setLoading(true);
    await updateSignupAction(product, !settings.signupEnabled[product]);
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="font-medium text-white flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-green-400" />
        Environment & Platform
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment Control */}
        <div className="md:col-span-2">
            <div className={`p-6 rounded-lg border flex items-center justify-between transition-colors ${
                settings.environment === "production"
                ? "bg-green-900/10 border-green-900/50"
                : "bg-blue-900/10 border-blue-900/50"
            }`}>
                <div>
                    <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-white">System Environment</h4>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                            settings.environment === "production" 
                            ? "bg-green-500 text-black" 
                            : "bg-blue-500 text-white"
                        }`}>
                            {settings.environment === "production" ? "LIVE / PRODUCTION" : "MOCK / DEMO"}
                        </span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
                        {settings.environment === "production" 
                            ? "System is running with real customer data. Mock data is hidden. All signups and transactions are real."
                            : "System is in Mock Mode. Showing generated demo data for testing. Switch to Production to go live."}
                    </p>
                </div>
                <button
                    onClick={toggleEnvironment}
                    disabled={loading}
                    className={`px-6 py-3 rounded font-bold text-sm shadow-lg transition-all transform active:scale-95 ${
                        settings.environment === "production"
                        ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
                        : "bg-green-600 text-white hover:bg-green-500 shadow-green-900/20"
                    }`}
                >
                    {settings.environment === "production" ? "Switch to Mock Mode" : "GO LIVE (Enable Production)"}
                </button>
            </div>
        </div>

        {/* Global Modes */}
        <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Global Modes</h4>
            
            <div className={`p-4 rounded-lg border flex items-center justify-between ${
                settings.maintenanceMode 
                ? "bg-red-900/10 border-red-900/50" 
                : "bg-zinc-950 border-zinc-800"
            }`}>
                <div className="flex items-center gap-3">
                    <AlertOctagon className={`w-5 h-5 ${settings.maintenanceMode ? "text-red-500" : "text-zinc-600"}`} />
                    <div>
                        <div className="text-sm font-medium text-white">Maintenance Mode</div>
                        <div className="text-xs text-zinc-500">Block all customer access</div>
                    </div>
                </div>
                <button
                    onClick={() => toggleMode("maintenanceMode")}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                        settings.maintenanceMode
                            ? "border-red-500 text-red-500 hover:bg-red-900/20"
                            : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                    }`}
                >
                    {settings.maintenanceMode ? "ACTIVE" : "INACTIVE"}
                </button>
            </div>

            <div className={`p-4 rounded-lg border flex items-center justify-between ${
                settings.readOnlyMode 
                ? "bg-amber-900/10 border-amber-900/50" 
                : "bg-zinc-950 border-zinc-800"
            }`}>
                <div className="flex items-center gap-3">
                    <Eye className={`w-5 h-5 ${settings.readOnlyMode ? "text-amber-500" : "text-zinc-600"}`} />
                    <div>
                        <div className="text-sm font-medium text-white">Read-Only Mode</div>
                        <div className="text-xs text-zinc-500">Disable all write operations</div>
                    </div>
                </div>
                <button
                    onClick={() => toggleMode("readOnlyMode")}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                        settings.readOnlyMode
                            ? "border-amber-500 text-amber-500 hover:bg-amber-900/20"
                            : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                    }`}
                >
                    {settings.readOnlyMode ? "ACTIVE" : "INACTIVE"}
                </button>
            </div>
        </div>

        {/* Signup Controls */}
        <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Signup Availability</h4>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800">
                {(Object.keys(settings.signupEnabled) as Array<keyof typeof settings.signupEnabled>).map(product => (
                    <div key={product} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <UserPlus className="w-4 h-4 text-zinc-600" />
                            <span className="text-sm font-medium text-zinc-300 capitalize">{product} Signups</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs ${settings.signupEnabled[product] ? "text-green-500" : "text-red-500"}`}>
                                {settings.signupEnabled[product] ? "Open" : "Closed"}
                            </span>
                            <button 
                                onClick={() => toggleSignup(product)}
                                disabled={loading}
                                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                                    settings.signupEnabled[product] ? "bg-green-600" : "bg-zinc-700"
                                }`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                    settings.signupEnabled[product] ? "translate-x-5" : "translate-x-0"
                                }`} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
