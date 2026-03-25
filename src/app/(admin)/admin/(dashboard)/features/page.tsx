"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth, postWithAuth } from "@/lib/api/fetcher";
import { Flag, Plus, Edit2, Check, X, Search, Globe, Users, Activity } from "lucide-react";
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
        tenantIds,
        action: isCreating ? "create" : "update"
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
        description: flag.description,
        action: "update"
      });
      loadFlags();
    } catch (err: any) {
      alert("Failed to toggle: " + err.message);
    }
  };

  if (loading) return <div className="p-8 text-zinc-400">Loading flags...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Flag className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Neural <span className="text-primary/40">Toggles</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Operational feature branches & safe-launch protocols
          </p>
        </div>
        <button 
          onClick={handleCreate}
          className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-foreground text-background transition-all flex items-center gap-3 active:scale-95 shadow-lg shadow-foreground/10 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Initialize_Flag
        </button>
      </div>

      {(isCreating || editing) && (
        <div className="bg-card border border-border rounded-[2.5rem] p-10 mb-12 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Flag className="w-48 h-48 text-primary" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-foreground mb-10 relative z-10 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {isCreating ? "New Protocol Definition" : "Update Operation Vector"}
          </h3>
          <div className="space-y-10 max-w-3xl relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 block">Flag Identifier</label>
                <div className="relative group/input">
                  <input 
                    type="text" 
                    value={formKey}
                    onChange={e => setFormKey(e.target.value)}
                    disabled={!isCreating}
                    placeholder="e.g. neuro_v2_core"
                    className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm text-foreground font-black focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner placeholder:opacity-20 disabled:opacity-30"
                  />
                </div>
                {!isCreating && <p className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest ml-2 italic">Identifier is immutable once committed to registry.</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 block">Behavioral Summary</label>
                <div className="relative group/input">
                  <input 
                    type="text" 
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    placeholder="Define protocol purpose..."
                    className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm text-foreground font-black focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner placeholder:opacity-20"
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted/10 border border-border rounded-2xl p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setFormGlobal(!formGlobal)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-300",
                    formGlobal ? "bg-success shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "bg-muted shadow-inner"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-background transition-all duration-300",
                    formGlobal ? "left-7" : "left-1"
                  )} />
                </button>
                <div>
                  <div className={cn("text-sm font-black uppercase tracking-widest transition-colors", formGlobal ? "text-success" : "text-muted-foreground/40")}>Global Propagation</div>
                  <div className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest mt-1">When enabled, this flag overrides all tenant-specific logic.</div>
                </div>
              </div>
              {formGlobal ? <Globe className="w-5 h-5 text-success/40" /> : <div className="w-5 h-5 border-2 border-dashed border-border rounded-full" />}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 block">Authority Overrides (UID List)</label>
              <textarea 
                value={formTenants}
                onChange={e => setFormTenants(e.target.value)}
                placeholder="ID_001, ID_002, ID_003..."
                className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-xs text-foreground font-mono focus:ring-2 focus:ring-primary/20 outline-none h-32 transition-all shadow-inner placeholder:opacity-20 resize-none"
              />
              <p className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest ml-2 italic">Specify unique tenant identifiers for granular rollouts.</p>
            </div>

            <div className="flex gap-4 pt-6 mt-6 border-t border-border">
              <button 
                onClick={handleSave}
                disabled={!formKey}
                className="flex-1 py-5 bg-foreground text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-all transform active:scale-95 shadow-2xl disabled:opacity-30"
              >
                Sync with Registry
              </button>
              <button 
                onClick={handleCancel}
                className="px-10 py-5 bg-muted border border-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-muted/80 transition-all transform active:scale-95"
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {flags.map(flag => (
          <div key={flag.key} className="bg-card border border-border rounded-[2.5rem] p-10 flex flex-col justify-between group hover:border-primary/20 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 duration-300">
            <div>
              <div className="flex items-start justify-between mb-8">
                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center border border-border group-hover:border-primary/20 transition-all shadow-inner">
                  <Activity className="w-6 h-6 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleGlobal(flag)}
                    className={cn(
                      "p-3 rounded-xl transition-all duration-300 active:scale-90",
                      flag.is_global_enabled 
                        ? "bg-success/10 border border-success/30 text-success shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                        : "bg-muted/50 border border-border text-muted-foreground/20"
                    )}
                    title={flag.is_global_enabled ? "Disable Globally" : "Enable Globally"}
                  >
                    <Globe className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleEdit(flag)}
                    className="p-3 rounded-xl bg-muted/50 border border-border text-muted-foreground/40 hover:text-foreground transition-all active:scale-90"
                    title="Edit Flag"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-foreground">{flag.key.replace(/_/g, ' ')}</h3>
                  <div className="text-[9px] font-mono font-black uppercase tracking-widest text-muted-foreground/20 italic">{flag.key}</div>
                </div>
                
                <p className="text-sm font-bold text-muted-foreground/40 leading-relaxed uppercase tracking-wide">{flag.description || "Experimental protocol segment."}</p>
                
                <div className="flex flex-wrap gap-2 pt-4">
                   <div className={cn(
                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                    flag.is_global_enabled ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground/30 border-border"
                  )}>
                    {flag.is_global_enabled ? "Global Propagation" : "Staged Rollout"}
                  </div>
                  {flag.tenant_overrides?.length > 0 && (
                    <div className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 shadow-sm flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      {flag.tenant_overrides.length} Overrides
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-border flex items-center justify-between">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/10">Last Registry Sync</div>
              <div className="text-[10px] font-mono font-bold text-muted-foreground/30">{new Date(flag.updated_at).toLocaleDateString()}</div>
            </div>
          </div>
        ))}

        {flags.length === 0 && !isCreating && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-card/30 border-2 border-dashed border-border rounded-[3rem] opacity-20">
            <Flag className="w-20 h-20 mb-6" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Neural Registry Empty</p>
            <button onClick={handleCreate} className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-0.5 hover:text-primary/80 transition-colors">Initialize First Node</button>
          </div>
        )}
      </div>
    </div>
  );
}
