"use client";

import { IntegrationConfig } from "@/types/settings";
import { toggleIntegrationAction, updateIntegrationAction } from "@/app/actions/settings";
import { useState } from "react";
import { Plug, CheckCircle, XCircle, Settings as SettingsIcon, Save } from "lucide-react";

export function IntegrationSettingsPanel({ integrations }: { integrations: IntegrationConfig[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<IntegrationConfig>>({});
  const [loading, setLoading] = useState(false);

  const handleToggle = async (id: string, current: boolean) => {
    if (!confirm(`Are you sure you want to ${current ? "DISABLE" : "ENABLE"} this integration?`)) return;
    setLoading(true);
    await toggleIntegrationAction(id, !current);
    setLoading(false);
  };

  const startEdit = (integration: IntegrationConfig) => {
    setEditingId(integration.id);
    setEditForm({ 
      ...integration,
      apiKey: "", 
      clientSecret: "" // Clear secrets
    });
  };

  const saveEdit = async (id: string) => {
    setLoading(true);
    await updateIntegrationAction(id, editForm);
    setLoading(false);
    setEditingId(null);
  };

  const renderConfigFields = (id: string) => {
    const inputClass = "w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none";
    const labelClass = "text-xs text-zinc-500 font-mono mb-1 block";

    if (id === "int_paddle") {
      return (
        <>
          <div>
            <label className={labelClass}>Vendor ID</label>
            <input 
              type="text"
              value={editForm.vendorId || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, vendorId: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Client-side Token (Public Key)</label>
            <input 
              type="text"
              value={editForm.publicKey || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, publicKey: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>API Key (pdl_...) - Leave empty to keep unchanged</label>
            <input 
              type="password"
              value={editForm.apiKey || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, apiKey: e.target.value }))}
              className={inputClass}
            />
          </div>
        </>
      );
    }

    if (id === "int_paypal") {
      return (
        <>
          <div>
            <label className={labelClass}>Client ID</label>
            <input 
              type="text"
              value={editForm.clientId || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, clientId: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Client Secret - Leave empty to keep unchanged</label>
            <input 
              type="password"
              value={editForm.clientSecret || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, clientSecret: e.target.value }))}
              className={inputClass}
            />
          </div>
        </>
      );
    }

    if (id === "int_razorpay") {
      return (
        <>
          <div>
            <label className={labelClass}>Key ID</label>
            <input 
              type="text"
              value={editForm.clientId || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, clientId: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Key Secret - Leave empty to keep unchanged</label>
            <input 
              type="password"
              value={editForm.clientSecret || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, clientSecret: e.target.value }))}
              className={inputClass}
            />
          </div>
        </>
      );
    }

    // Default for others (Twilio, Stripe, etc.)
    return (
      <div>
        <label className={labelClass}>API Key / Secret Token</label>
        <input 
          type="password"
          value={editForm.apiKey || ""}
          onChange={(e) => setEditForm(prev => ({ ...prev, apiKey: e.target.value }))}
          className={inputClass}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {integrations.map(integration => (
        <div key={integration.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${integration.enabled ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-500'}`}>
                <Plug className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-200">{integration.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${integration.status === 'connected' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                     {integration.status}
                   </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleToggle(integration.id, integration.enabled)}
                disabled={loading}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${integration.enabled ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
              >
                {integration.enabled ? 'Disable' : 'Enable'}
              </button>
              
              <button 
                onClick={() => editingId === integration.id ? setEditingId(null) : startEdit(integration)}
                className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {editingId === integration.id && (
            <div className="mt-4 pt-4 border-t border-zinc-800 animate-in slide-in-from-top-2 fade-in duration-200">
               <div className="space-y-4">
                  {renderConfigFields(integration.id)}
                  
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => saveEdit(integration.id)}
                      disabled={loading}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded text-xs font-medium transition-colors"
                    >
                      <Save className="w-3 h-3" />
                      Save Configuration
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      ))}

      {integrations.length === 0 && (
        <div className="text-center py-12 text-zinc-500 text-sm">
           No integrations configured.
        </div>
      )}
    </div>
  );
}
