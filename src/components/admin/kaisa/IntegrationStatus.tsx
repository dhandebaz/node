
"use client";

import { KaisaIntegrationConfig, IntegrationConfigDetails } from "@/types/kaisa";
import { toggleIntegrationAction, updateIntegrationConfigAction, getIntegrationStatsAction } from "@/app/actions/kaisa";
import { useState, useEffect } from "react";
import { Link2, CheckCircle, XCircle, AlertCircle, Settings2, Save, X } from "lucide-react";

export function IntegrationStatus({ integrations }: { integrations: KaisaIntegrationConfig[] }) {
    const [loading, setLoading] = useState<string | null>(null);
    const [editing, setEditing] = useState<string | null>(null);
  
    const handleToggle = async (name: string, current: boolean) => {
        if (!confirm(`Are you sure you want to ${current ? 'disable' : 'enable'} ${name} integration globally?`)) return;
        setLoading(name);
        await toggleIntegrationAction(name, !current);
        setLoading(null);
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
             <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-white" />
                <h3 className="font-medium text-white">System Integrations</h3>
            </div>
            <div className="divide-y divide-zinc-800">
                {integrations.map(int => (
                    <div key={int.name}>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                 <StatusIcon status={int.status} />
                                 <div>
                                     <div className="text-sm font-medium text-white">{int.name}</div>
                                     <div className="text-xs text-zinc-500 capitalize">{int.status}</div>
                                 </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEditing(editing === int.name ? null : int.name)}
                                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                                    title="Configure"
                                >
                                    <Settings2 className="w-4 h-4" />
                                </button>
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
                        </div>
                        
                        {editing === int.name && (
                            <IntegrationEditForm 
                                integration={int} 
                                onClose={() => setEditing(null)} 
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function IntegrationEditForm({ integration, onClose }: { integration: KaisaIntegrationConfig; onClose: () => void }) {
    const [config, setConfig] = useState<IntegrationConfigDetails>(integration.config || {});
    const [saving, setSaving] = useState(false);
    const [detectedOrigin, setDetectedOrigin] = useState<string>("");
    const [stats, setStats] = useState<Record<string, number> | null>(null);

    // Detect current origin and smart autodetect
    useEffect(() => {
        if (typeof window !== "undefined") {
            const origin = window.location.origin;
            setDetectedOrigin(origin);

            // Smart Autodetect: If URL is empty, automatically set it to current environment
            if (integration.name === "Listings" && !config.icalBaseUrl) {
                setConfig(prev => ({ ...prev, icalBaseUrl: `${origin}/api/ical` }));
            }
        }
    }, [integration.name]); // Depend on name so it runs when opening different integrations if needed, though component remounts

    // Fetch stats for specific integrations
    useEffect(() => {
        if (integration.name === "Listings") {
            getIntegrationStatsAction("Listings").then(res => setStats(res.stats));
        }
    }, [integration.name]);

    const handleSave = async () => {
        setSaving(true);
        await updateIntegrationConfigAction(integration.name, config);
        setSaving(false);
        onClose();
    };

    const handleChange = (key: keyof IntegrationConfigDetails, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="px-4 pb-4 bg-zinc-900/50 border-t border-zinc-800/50">
            <div className="pt-4 space-y-4">
                {integration.name === "Calendar" && (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400">Google Client ID</label>
                            <input 
                                type="text"
                                value={config.googleClientId || ""}
                                onChange={(e) => handleChange("googleClientId", e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
                                placeholder="OAuth Client ID"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400">Google Client Secret</label>
                            <input 
                                type="password"
                                value={config.googleClientSecret || ""}
                                onChange={(e) => handleChange("googleClientSecret", e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
                                placeholder="OAuth Client Secret"
                            />
                        </div>
                        <div className="text-xs text-zinc-500">
                            Enables synchronization for Channel Manager features.
                        </div>
                    </>
                )}

                {integration.name === "CRM" && (
                    <>
                         <div className="space-y-1">
                            <label className="text-xs text-zinc-400">Supported Import Providers</label>
                            <input 
                                type="text"
                                value={config.supportedProviders?.join(", ") || ""}
                                onChange={(e) => handleChange("supportedProviders", e.target.value.split(",").map(s => s.trim()))}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
                                placeholder="Salesforce, HubSpot, Zoho (comma separated)"
                            />
                        </div>
                         <div className="text-xs text-zinc-500">
                            Allows customers to import data from these external CRMs.
                        </div>
                    </>
                )}

                {integration.name === "Listings" && (
                    <>
                        <div className="flex items-center gap-2">
                             <input 
                                type="checkbox"
                                id="ical-gen"
                                checked={config.icalGenerationEnabled || false}
                                onChange={(e) => handleChange("icalGenerationEnabled", e.target.checked)}
                                className="rounded bg-zinc-950 border-zinc-800"
                            />
                            <label htmlFor="ical-gen" className="text-sm text-zinc-300">Enable iCal Link Generation</label>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-zinc-400">iCal Base URL</label>
                                <div className="flex gap-2">
                                    {detectedOrigin && (
                                        <button 
                                            type="button"
                                            onClick={() => handleChange("icalBaseUrl", `${detectedOrigin}/api/ical`)}
                                            className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                                        >
                                            Use Current Domain
                                        </button>
                                    )}
                                    <button 
                                        type="button"
                                        onClick={() => handleChange("icalBaseUrl", `https://nodebase.space/api/ical`)}
                                        className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                                    >
                                        Use Production
                                    </button>
                                </div>
                            </div>
                            <input 
                                type="text"
                                value={config.icalBaseUrl || ""}
                                onChange={(e) => handleChange("icalBaseUrl", e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
                                placeholder="https://api.nodebase.io/ical"
                            />
                            {detectedOrigin && config.icalBaseUrl && (
                                <div className="flex items-center gap-1.5 mt-1 px-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${config.icalBaseUrl.startsWith(detectedOrigin) ? 'bg-green-500' : 'bg-amber-500'}`} />
                                    <span className="text-[10px] text-zinc-500">
                                        {config.icalBaseUrl.startsWith(detectedOrigin) 
                                            ? "Matches current environment" 
                                            : "Different from current environment (Check before saving)"}
                                    </span>
                                </div>
                            )}

                            {stats && stats.active_icals !== undefined && (
                                <div className="mt-3 p-3 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-zinc-400">Active Nodebase iCals</span>
                                        <span className="text-[10px] text-zinc-600">Live usage based on active modules</span>
                                    </div>
                                    <span className="text-lg font-mono text-white">{stats.active_icals}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-zinc-500">
                            Used for Airbnb, Booking.com, Agoda availability sync.
                        </div>
                    </>
                )}

                {integration.name === "Messaging" && (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400">Meta App ID</label>
                            <input 
                                type="text"
                                value={config.metaAppId || ""}
                                onChange={(e) => handleChange("metaAppId", e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400">Meta App Secret</label>
                            <input 
                                type="password"
                                value={config.metaAppSecret || ""}
                                onChange={(e) => handleChange("metaAppSecret", e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
                            />
                        </div>
                         <div className="text-xs text-zinc-500">
                            Required for WhatsApp, Instagram, and Facebook Messenger integration.
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <button 
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                    >
                        <Save className="w-3 h-3" />
                        {saving ? "Saving..." : "Save Configuration"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatusIcon({ status }: { status: string }) {
    if (status === "active") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "issues") return <AlertCircle className="w-4 h-4 text-amber-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
}
