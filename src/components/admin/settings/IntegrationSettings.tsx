
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
    setEditForm({ apiKey: "", webhookUrl: integration.webhookUrl }); // Clear API key on edit
  };

  const saveEdit = async (id: string) => {
    setLoading(true);
    await updateIntegrationAction(id, editForm);
    setLoading(false);
    setEditingId(null);
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
                  <div>
                    <label className="text-xs text-zinc-500 font-mono mb-1 block">API Key (Leave empty to keep unchanged)</label>
                    <input 
                      type="password"
                      placeholder="Enter new API key to update..."
                      value={editForm.apiKey || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, apiKey: e.target.value }))}
                      className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
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
