"use client";

import { IntegrationConfig } from "@/types/settings";
import { toggleIntegrationAction, updateIntegrationAction } from "@/app/actions/settings";
import { useState } from "react";
import { Plug, CheckCircle, XCircle, Settings as SettingsIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const inputClass = "w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono font-bold placeholder:opacity-20";
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 ml-1 block";

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
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm group">
      <div className="p-8 border-b border-border flex justify-between items-center bg-muted/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-inner">
            <Plug className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">External Interfaces</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Connected authority & payment gateways.</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {integrations.map((integration) => (
          <div key={integration.id} className="p-8 hover:bg-muted/10 transition-colors group/item">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground group-hover/item:text-primary transition-colors">{integration.name}</h3>
                  {integration.enabled ? (
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20 shadow-sm">
                      <div className="w-1 h-1 rounded-full bg-success animate-pulse" /> Compliance Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 bg-muted px-2.5 py-1 rounded-full border border-border">
                      Interface Offline
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground/30 font-mono text-[10px] font-black uppercase tracking-[0.2em]">{integration.id}</p>
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={() => editingId === integration.id ? setEditingId(null) : startEdit(integration)}
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground/40 hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-90 border border-transparent hover:border-primary/20"
                >
                  <SettingsIcon className="w-5 h-5" />
                </button>
                <div 
                  onClick={() => handleToggle(integration.id, integration.enabled)}
                  className={cn(
                    "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 shadow-inner",
                    integration.enabled ? "bg-success shadow-success/20" : "bg-muted border border-border"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full transition-all duration-300 shadow-md",
                    integration.enabled ? "left-7 bg-white" : "left-1 bg-muted-foreground/30"
                  )} />
                </div>
              </div>
            </div>

            {/* Edit Mode */}
            {editingId === integration.id && (
              <div className="mt-8 pt-8 border-t border-border animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {renderConfigFields(integration.id)}
                </div>
                <div className="flex justify-end gap-6">
                  <button 
                    onClick={() => setEditingId(null)}
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-colors"
                  >
                    Abort Edit
                  </button>
                  <button 
                    onClick={() => saveEdit(integration.id)}
                    disabled={loading}
                    className="flex items-center gap-3 px-6 py-3 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-30"
                  >
                    <Save className="w-4 h-4" /> Commit Authority
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
