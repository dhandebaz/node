"use client";

import { AuthSettings, OTPProvider } from "@/types/settings";
import { updateAuthSettingsAction } from "@/app/actions/settings";
import { useState } from "react";
import { Shield, Lock, AlertTriangle } from "lucide-react";

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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Authentication & OTP
        </h3>
        {hasChanges && (
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* OTP Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-medium uppercase">OTP Provider</label>
            <select 
              value={formData.otpProvider}
              onChange={(e) => handleChange("otpProvider", e.target.value as OTPProvider)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
            >
              <option value="Twilio">Twilio</option>
              <option value="Firebase">Firebase</option>
              <option value="Custom">Custom Gateway</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-medium uppercase">OTP Expiry (Seconds)</label>
            <input 
              type="number"
              value={formData.otpExpirySeconds}
              onChange={(e) => handleChange("otpExpirySeconds", parseInt(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-medium uppercase">Max Retries</label>
            <input 
              type="number"
              value={formData.otpRetryLimit}
              onChange={(e) => handleChange("otpRetryLimit", parseInt(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
            />
          </div>
          
           <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-medium uppercase">Rate Limit (Req/Min)</label>
            <div className="flex gap-2">
                 <input 
                  type="number"
                  value={formData.rateLimitMaxRequests}
                  onChange={(e) => handleChange("rateLimitMaxRequests", parseInt(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
            </div>
          </div>
        </div>

        {/* Emergency Admin Login Toggle */}
        <div className="pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${settings.adminLoginEnabled ? "bg-green-900/20" : "bg-red-900/20"}`}>
                        {settings.adminLoginEnabled ? <Lock className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">Admin Portal Access</div>
                        <div className="text-xs text-zinc-500">Emergency master switch for all admin logins</div>
                    </div>
                </div>
                <button
                    onClick={toggleAdminLogin}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                        settings.adminLoginEnabled 
                            ? "border-red-900/50 text-red-400 hover:bg-red-900/20" 
                            : "border-green-900/50 text-green-400 hover:bg-green-900/20"
                    }`}
                >
                    {settings.adminLoginEnabled ? "Disable Access" : "Enable Access"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
