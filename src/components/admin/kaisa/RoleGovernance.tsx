
"use client";

import { KaisaRoleConfig, KaisaRoleType } from "@/types/kaisa";
import { updateRoleConfigAction } from "@/app/actions/kaisa";
import { useState } from "react";
import { Loader2, Crown, Shield } from "lucide-react";

export function RoleGovernance({ roles }: { roles: KaisaRoleConfig[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (type: KaisaRoleType, field: 'enabled' | 'inviteOnly', value: boolean) => {
    setLoading(`${type}-${field}`);
    await updateRoleConfigAction(type, { [field]: value });
    setLoading(null);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
        <Crown className="w-5 h-5 text-brand-blue" />
        <h3 className="font-medium text-white">Pricing & Role Governance</h3>
      </div>
      
      <div className="divide-y divide-zinc-800">
        {roles.map((role) => (
          <div key={role.type} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                 <div className="capitalize font-medium text-white">{role.type}</div>
                 <div className="text-xs text-zinc-500 font-mono">₹{role.priceMonthly}/mo</div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={role.inviteOnly}
                        onChange={(e) => handleToggle(role.type, 'inviteOnly', e.target.checked)}
                        disabled={!!loading}
                        className="rounded bg-zinc-800 border-zinc-700 text-brand-blue focus:ring-0"
                    />
                    Invite Only
                </label>
                <div className="h-4 w-px bg-zinc-800 mx-1"></div>
                <button
                    onClick={() => handleToggle(role.type, 'enabled', !role.enabled)}
                    disabled={!!loading}
                    className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${
                        role.enabled 
                            ? "bg-green-900/20 text-green-400 border-green-900"
                            : "bg-red-900/20 text-red-400 border-red-900"
                    }`}
                >
                    {role.enabled ? "Active" : "Paused"}
                </button>
              </div>
            </div>
            {loading?.startsWith(role.type) && <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />}
          </div>
        ))}
      </div>
    </div>
  );
}
