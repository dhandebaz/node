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
              value={editForm.clientId || ""} // Reuse clientId for Key ID
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

    if (id === "int_twilio") {
      return (
        <>
          <div>
            <label className={labelClass}>Account SID</label>
            <input 
              type="text"
              value={editForm.accountSid || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, accountSid: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Auth Token - Leave empty to keep unchanged</label>
            <input 
              type="password"
              value={editForm.authToken || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, authToken: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>From Phone Number</label>
            <input 
              type="text"
              value={editForm.fromPhoneNumber || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, fromPhoneNumber: e.target.value }))}
              className={inputClass}
            />
          </div>
        </>
      );
    }

    return (
      <div>
        <label className={labelClass}>API Key / Secret</label>
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
    <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Plug className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Integrations</h2>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {integrations.map((integration) => (
          <div key={integration.id} className="p-6 hover:bg-white/5 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-white">{integration.name}</h3>
                  {integration.enabled ? (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-zinc-500 bg-zinc-500/10 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" /> Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 font-mono text-[10px] uppercase tracking-wider">{integration.id}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => editingId === integration.id ? setEditingId(null) : startEdit(integration)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
                <div 
                  onClick={() => handleToggle(integration.id, integration.enabled)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                    integration.enabled ? "bg-green-500" : "bg-zinc-700"
                  }`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                    integration.enabled ? "left-6" : "left-1"
                  }`} />
                </div>
              </div>
            </div>

            {/* Edit Mode */}
            {editingId === integration.id && (
              <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {renderConfigFields(integration.id)}
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => saveEdit(integration.id)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    <Save className="w-3 h-3" /> Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
