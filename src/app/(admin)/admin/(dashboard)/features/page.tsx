"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth, postWithAuth } from "@/lib/api/fetcher";
import { Flag, Plus, Edit2, Check, X, Search, Globe, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureFlag {
  key: string;
  description: string;
  is_global_enabled: boolean;
  tenant_overrides: string[]; // List of tenant IDs where it's enabled
  updated_at: string;
}

export default function AdminFeatureFlagPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FeatureFlag | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formKey, setFormKey] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formGlobal, setFormGlobal] = useState(false);
  const [formTenants, setFormTenants] = useState(""); // Comma separated

  const loadFlags = async () => {
    try {
      const data = await fetchWithAuth<{ flags: FeatureFlag[] }>("/api/admin/features");
      setFlags(data.flags);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleEdit = (flag: FeatureFlag) => {
    setEditing(flag);
    setFormKey(flag.key);
    setFormDesc(flag.description || "");
    setFormGlobal(flag.is_global_enabled);
    setFormTenants((flag.tenant_overrides || []).join(", "));
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditing(null);
    setFormKey("");
    setFormDesc("");
    setFormGlobal(false);
    setFormTenants("");
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditing(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      const tenantIds = formTenants.split(",").map(s => s.trim()).filter(Boolean);
      
      await postWithAuth("/api/admin/features", {
        key: formKey,
        description: formDesc,
        isGlobal: formGlobal,
        tenantIds
      });
      
      handleCancel();
      loadFlags();
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    }
  };

  const toggleGlobal = async (flag: FeatureFlag) => {
    if (!confirm(`Are you sure you want to ${flag.is_global_enabled ? 'DISABLE' : 'ENABLE'} this feature globally?`)) return;
    
    try {
      await postWithAuth("/api/admin/features", {
        key: flag.key,
        isGlobal: !flag.is_global_enabled,
        tenantIds: flag.tenant_overrides,
        description: flag.description
      });
      loadFlags();
    } catch (err: any) {
      alert("Failed to toggle: " + err.message);
    }
  };

  if (loading) return <div className="p-8 text-zinc-400">Loading flags...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-white">Feature Flags</h1>
          <p className="text-zinc-400">Manage feature rollouts and safe launches.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Flag
        </button>
      </div>

      {(isCreating || editing) && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-white mb-6">
            {isCreating ? "New Feature Flag" : "Edit Feature Flag"}
          </h3>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs uppercase text-zinc-500 mb-1">Flag Key</label>
              <input 
                type="text" 
                value={formKey}
                onChange={e => setFormKey(e.target.value)}
                disabled={!isCreating}
                placeholder="e.g. new_inbox_ui"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:border-zinc-700 outline-none disabled:opacity-50"
              />
              <p className="text-xs text-zinc-600 mt-1">Unique identifier used in code. Cannot be changed once created.</p>
            </div>
            
            <div>
              <label className="block text-xs uppercase text-zinc-500 mb-1">Description</label>
              <input 
                type="text" 
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="What does this feature do?"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:border-zinc-700 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <button 
                onClick={() => setFormGlobal(!formGlobal)}
                className={cn(
                  "w-10 h-6 rounded-full relative transition-colors",
                  formGlobal ? "bg-emerald-500" : "bg-zinc-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                  formGlobal ? "left-5" : "left-1"
                )} />
              </button>
              <span className="text-sm font-medium text-white">Enable Globally</span>
            </div>

            <div>
              <label className="block text-xs uppercase text-zinc-500 mb-1">Tenant Overrides (Optional)</label>
              <textarea 
                value={formTenants}
                onChange={e => setFormTenants(e.target.value)}
                placeholder="tenant_id_1, tenant_id_2..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:border-zinc-700 outline-none h-20 font-mono text-xs"
              />
              <p className="text-xs text-zinc-600 mt-1">Comma-separated list of tenant IDs to enable this feature for, even if disabled globally.</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={handleSave}
                disabled={!formKey}
                className="px-4 py-2 bg-white text-black rounded font-bold hover:bg-zinc-200 disabled:opacity-50"
              >
                Save Flag
              </button>
              <button 
                onClick={handleCancel}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded font-bold hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {flags.map(flag => (
          <div key={flag.key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-start justify-between group hover:border-zinc-700 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-mono font-semibold text-white">{flag.key}</h3>
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1",
                  flag.is_global_enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                )}>
                  {flag.is_global_enabled ? <><Globe className="w-3 h-3" /> Global On</> : "Global Off"}
                </div>
                {flag.tenant_overrides?.length > 0 && (
                  <div className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-500 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {flag.tenant_overrides.length} Overrides
                  </div>
                )}
              </div>
              <p className="text-zinc-400 text-sm">{flag.description || "No description provided."}</p>
              <div className="mt-4 flex items-center gap-6 text-xs text-zinc-500">
                <span>Updated: {new Date(flag.updated_at).toLocaleDateString()}</span>
                {flag.tenant_overrides?.length > 0 && (
                  <span title={flag.tenant_overrides.join("\n")}>
                    Enabled for: {flag.tenant_overrides.slice(0, 3).join(", ")}
                    {flag.tenant_overrides.length > 3 && ` +${flag.tenant_overrides.length - 3} more`}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => toggleGlobal(flag)}
                className={cn(
                  "p-2 rounded hover:bg-zinc-800 transition-colors",
                  flag.is_global_enabled ? "text-emerald-500" : "text-zinc-500"
                )}
                title={flag.is_global_enabled ? "Disable Globally" : "Enable Globally"}
              >
                <Globe className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleEdit(flag)}
                className="p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Edit Flag"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {flags.length === 0 && !isCreating && (
          <div className="text-center py-20 text-zinc-500 bg-zinc-900/50 border border-zinc-800/50 border-dashed rounded-xl">
            <Flag className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No feature flags created yet.</p>
            <button onClick={handleCreate} className="text-white hover:underline mt-2">Create your first flag</button>
          </div>
        )}
      </div>
    </div>
  );
}
