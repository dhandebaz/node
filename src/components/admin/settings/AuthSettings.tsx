"use client";

import { AuthSettings, OTPProvider } from "@/types/settings";
import { updateAuthSettingsAction } from "@/app/actions/settings";
import { useState } from "react";
import { Shield, Lock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthSettingsPanel({ settings }: { settings: AuthSettings }) {
  const [formData, setFormData] = useState(settings);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof AuthSettings, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    await updateAuthSettingsAction(formData);
    setLoading(false);
    setHasChanges(false);
  };

  const toggleAdminLogin = async () => {
    if (!confirm(`Are you sure you want to ${settings.adminLoginEnabled ? "DISABLE" : "ENABLE"} Admin Login? This is a critical action.`)) return;
    
    setLoading(true);
    await updateAuthSettingsAction({ adminLoginEnabled: !settings.adminLoginEnabled });
    setLoading(false);
    // Refresh local state handled by parent revalidation usually, but we update local for responsiveness
    setFormData(prev => ({ ...prev, adminLoginEnabled: !prev.adminLoginEnabled }));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm group">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          Access Protocol
        </h3>
        {hasChanges && (
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95"
          >
            {loading ? "Syncing..." : "Commit Protocol"}
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* OTP Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">OTP Gateway</label>
            <select 
              value={formData.otpProvider}
              onChange={(e) => handleChange("otpProvider", e.target.value as OTPProvider)}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            >
              <option value="Twilio">Twilio Global</option>
              <option value="Custom">Independent Gateway</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Token TTL (Seconds)</label>
            <input 
              type="number"
              value={formData.otpExpirySeconds}
              onChange={(e) => handleChange("otpExpirySeconds", parseInt(e.target.value))}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono font-bold"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Max Verification Attempts</label>
            <input 
              type="number"
              value={formData.otpRetryLimit}
              onChange={(e) => handleChange("otpRetryLimit", parseInt(e.target.value))}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono font-bold"
            />
          </div>
          
           <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Throughput Limit (RPM)</label>
            <div className="flex gap-2">
                 <input 
                  type="number"
                  value={formData.rateLimitMaxRequests}
                  onChange={(e) => handleChange("rateLimitMaxRequests", parseInt(e.target.value))}
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono font-bold"
                />
            </div>
          </div>
        </div>

        {/* Emergency Admin Login Toggle */}
        <div className="pt-8 border-t border-border mt-4">
            <div className="flex items-center justify-between p-5 bg-muted/30 border border-border rounded-2xl relative overflow-hidden group/access">
                <div className={cn(
                  "absolute inset-y-0 left-0 w-1 transition-all duration-500",
                  settings.adminLoginEnabled ? "bg-success" : "bg-destructive"
                )} />
                <div className="flex items-center gap-5 relative z-10">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center border transition-colors shadow-inner",
                      settings.adminLoginEnabled ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                        {settings.adminLoginEnabled ? <Lock className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>
                    <div>
                        <div className="text-sm font-black uppercase tracking-widest text-foreground mb-0.5">Console Lockdown</div>
                        <div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground opacity-60">Global master override for all administrative entrypoints</div>
                    </div>
                </div>
                <button
                    onClick={toggleAdminLogin}
                    disabled={loading}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all relative z-10 shadow-sm active:scale-95",
                      settings.adminLoginEnabled 
                          ? "bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:shadow-destructive/20" 
                          : "bg-success/10 border-success/20 text-success hover:bg-success hover:text-success-foreground hover:shadow-success/20"
                    )}
                >
                    {settings.adminLoginEnabled ? "Seal Console" : "Authorize Console"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
