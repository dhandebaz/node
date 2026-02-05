
"use client";

import { ApiSettings } from "@/types/settings";
import { updateApiSettingsAction, rotateApiKeysAction } from "@/app/actions/settings";
import { useState } from "react";
import { Server, RefreshCw, Radio, Key, Globe, Sparkles } from "lucide-react";

export function ApiSettingsPanel({ settings }: { settings: ApiSettings }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (key: keyof ApiSettings) => {
    // @ts-ignore
    const current = settings[key];
    setLoading(true);
    await updateApiSettingsAction({ [key]: !current });
    setLoading(false);
  };

  const handleRotation = async () => {
    if (!confirm("CRITICAL: This will invalidate all current internal API keys immediately. Services using old keys will fail. Continue?")) return;
    setLoading(true);
    await rotateApiKeysAction();
    setLoading(false);
  };

  const handleGeminiKeyUpdate = async (value: string) => {
    setLoading(true);
    await updateApiSettingsAction({ geminiApiKey: value });
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="font-medium text-white flex items-center gap-2 mb-6">
        <Server className="w-5 h-5 text-cyan-400" />
        API & Webhooks
      </h3>

      <div className="space-y-6">
        <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Internal API Access</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button
                    onClick={() => handleToggle("publicApiEnabled")}
                    disabled={loading}
                    className={`p-4 rounded-lg border flex items-center justify-between ${
                        settings.publicApiEnabled
                            ? "bg-cyan-900/10 border-cyan-900/50"
                            : "bg-zinc-950 border-zinc-800"
                    }`}
                 >
                    <div className="flex items-center gap-3">
                        <Globe className={`w-5 h-5 ${settings.publicApiEnabled ? "text-cyan-400" : "text-zinc-600"}`} />
                        <div className="text-left">
                            <div className={`text-sm font-medium ${settings.publicApiEnabled ? "text-cyan-100" : "text-zinc-400"}`}>Public API</div>
                            <div className="text-xs text-zinc-500">External developer access</div>
                        </div>
                    </div>
                    <div className={`text-xs font-bold ${settings.publicApiEnabled ? "text-cyan-400" : "text-zinc-600"}`}>
                        {settings.publicApiEnabled ? "ON" : "OFF"}
                    </div>
                 </button>

                 <button
                    onClick={() => handleToggle("partnerApiEnabled")}
                    disabled={loading}
                    className={`p-4 rounded-lg border flex items-center justify-between ${
                        settings.partnerApiEnabled
                            ? "bg-cyan-900/10 border-cyan-900/50"
                            : "bg-zinc-950 border-zinc-800"
                    }`}
                 >
                    <div className="flex items-center gap-3">
                        <Key className={`w-5 h-5 ${settings.partnerApiEnabled ? "text-cyan-400" : "text-zinc-600"}`} />
                        <div className="text-left">
                            <div className={`text-sm font-medium ${settings.partnerApiEnabled ? "text-cyan-100" : "text-zinc-400"}`}>Partner API</div>
                            <div className="text-xs text-zinc-500">B2B integration endpoints</div>
                        </div>
                    </div>
                    <div className={`text-xs font-bold ${settings.partnerApiEnabled ? "text-cyan-400" : "text-zinc-600"}`}>
                        {settings.partnerApiEnabled ? "ON" : "OFF"}
                    </div>
                 </button>
            </div>

            <button
                onClick={() => handleToggle("webhookOutgoingEnabled")}
                disabled={loading}
                className={`w-full p-4 rounded-lg border flex items-center justify-between ${
                    settings.webhookOutgoingEnabled
                        ? "bg-purple-900/10 border-purple-900/50"
                        : "bg-zinc-950 border-zinc-800"
                }`}
            >
                <div className="flex items-center gap-3">
                    <Radio className={`w-5 h-5 ${settings.webhookOutgoingEnabled ? "text-purple-400" : "text-zinc-600"}`} />
                    <div className="text-left">
                        <div className={`text-sm font-medium ${settings.webhookOutgoingEnabled ? "text-purple-100" : "text-zinc-400"}`}>Outgoing Webhooks</div>
                        <div className="text-xs text-zinc-500">Global kill switch for all webhook events</div>
                    </div>
                </div>
                <div className={`text-xs font-bold ${settings.webhookOutgoingEnabled ? "text-purple-400" : "text-zinc-600"}`}>
                    {settings.webhookOutgoingEnabled ? "ACTIVE" : "PAUSED"}
                </div>
            </button>
        </div>

        <div className="pt-4 border-t border-zinc-800">
             <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">AI Integration</h4>
             <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-blue-900/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-medium text-white block mb-1">Gemini API Key</label>
                        <p className="text-xs text-zinc-500 mb-3">Required for automated identity verification (KYC) processing.</p>
                        <input 
                            type="password"
                            placeholder="Enter Gemini API Key"
                            value={settings.geminiApiKey || ""}
                            onChange={(e) => handleGeminiKeyUpdate(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
             </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
             <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Key Management</h4>
             <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                <div>
                    <div className="text-sm font-medium text-white">Internal API Keys</div>
                    <div className="text-xs text-zinc-500">
                        Last rotation: {settings.rotationLastPerformed ? new Date(settings.rotationLastPerformed).toLocaleString() : "Never"}
                    </div>
                </div>
                <button
                    onClick={handleRotation}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded border border-zinc-700 transition-colors"
                >
                    <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                    Rotate Keys
                </button>
             </div>
        </div>
      </div>
    </div>
  );
}
