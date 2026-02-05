
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

    if (id === "int_firebase") {
      return (
        <div className="space-y-4">
           {/* Auto-parser */}
           <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded">
              <label className={`${labelClass} text-purple-400`}>Paste Config Snippet (Auto-fill)</label>
              <textarea
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-400 focus:border-purple-500 focus:outline-none h-24"
                placeholder={`const firebaseConfig = { \n  apiKey: "...", \n  ... \n};`}
                onChange={(e) => {
                   const txt = e.target.value;
                   const updates: any = {};
                   const match = (key: string) => {
                      // Match both key: "value" and key: 'value'
                      const regex = new RegExp(`${key}:\\s*["']([^"']+)["']`);
                      const m = txt.match(regex);
                      if (m) updates[key] = m[1];
                   };
                   match("apiKey");
                   match("authDomain");
                   match("projectId");
                   match("storageBucket");
                   match("messagingSenderId");
                   match("appId");
                   match("measurementId");
                   
                   if (Object.keys(updates).length > 0) {
                      setEditForm(prev => ({ ...prev, ...updates }));
                   }
                }}
              />
              <p className="text-[10px] text-zinc-600 mt-1">
                Paste your firebaseConfig object here to automatically populate the fields below.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>API Key</label>
                <input 
                  type="text"
                  value={editForm.apiKey || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, apiKey: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Project ID</label>
                <input 
                  type="text"
                  value={editForm.projectId || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, projectId: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Auth Domain</label>
                <input 
                  type="text"
                  value={editForm.authDomain || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, authDomain: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Storage Bucket</label>
                <input 
                  type="text"
                  value={editForm.storageBucket || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, storageBucket: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Messaging Sender ID</label>
                <input 
                  type="text"
                  value={editForm.messagingSenderId || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, messagingSenderId: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>App ID</label>
                <input 
                  type="text"
                  value={editForm.appId || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, appId: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Measurement ID (Optional)</label>
                <input 
                  type="text"
                  value={editForm.measurementId || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, measurementId: e.target.value }))}
                  className={inputClass}
                />
              </div>
           </div>
        </div>
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
              placeholder="+1234567890"
              value={editForm.fromPhoneNumber || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, fromPhoneNumber: e.target.value }))}
              className={inputClass}
            />
          </div>
        </>
      );
    }

    // Default (Stripe)
    return (
      <div>
        <label className={labelClass}>API Key (Leave empty to keep unchanged)</label>
        <input 
          type="password"
          placeholder="Enter new API key to update..."
          value={editForm.apiKey || ""}
          onChange={(e) => setEditForm(prev => ({ ...prev, apiKey: e.target.value }))}
          className={inputClass}
        />
      </div>
    );
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="font-medium text-white flex items-center gap-2 mb-6">
        <Plug className="w-5 h-5 text-purple-400" />
        Integrations
      </h3>

      <div className="space-y-4">
        {integrations.map((int) => (
          <div key={int.id} className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                    int.status === "connected" ? "bg-green-500" : 
                    int.status === "error" ? "bg-red-500" : "bg-zinc-700"
                }`} />
                <div>
                  <div className="text-sm font-medium text-white">{int.name}</div>
                  <div className="text-xs text-zinc-500 font-mono">{int.id}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleToggle(int.id, int.enabled)}
                  disabled={loading}
                  className={`text-xs font-bold px-2 py-1 rounded border ${
                    int.enabled 
                      ? "border-green-900/50 text-green-400 bg-green-900/10" 
                      : "border-zinc-700 text-zinc-500 bg-zinc-800/50"
                  }`}
                >
                  {int.enabled ? "ENABLED" : "DISABLED"}
                </button>
                <button 
                  onClick={() => editingId === int.id ? setEditingId(null) : startEdit(int)}
                  className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Config Panel */}
            {editingId === int.id && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {renderConfigFields(int.id)}
                  <div>
                    <label className="text-xs text-zinc-500 font-mono mb-1 block">Webhook URL</label>
                    <input 
                      type="text"
                      value={editForm.webhookUrl || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => saveEdit(int.id)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded"
                  >
                    <Save className="w-3 h-3" />
                    Save Config
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
