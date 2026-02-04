
"use client";

import { SpaceGlobalConfig } from "@/types/space";
import { togglePlanAction, togglePlanInviteOnlyAction } from "@/app/actions/space";
import { useState } from "react";
import { Lock, Unlock, Eye, EyeOff } from "lucide-react";

export function SpacePlanGovernance({ config }: { config: SpaceGlobalConfig }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleEnable = async (planName: string, currentEnabled: boolean) => {
    if (!confirm(`Are you sure you want to ${currentEnabled ? "DISABLE" : "ENABLE"} the ${planName} plan?`)) return;
    
    setLoading(`enable-${planName}`);
    await togglePlanAction(planName, !currentEnabled);
    setLoading(null);
  };

  const handleToggleInvite = async (planName: string, currentInvite: boolean) => {
    setLoading(`invite-${planName}`);
    await togglePlanInviteOnlyAction(planName, !currentInvite);
    setLoading(null);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
      <h3 className="font-bold text-white text-lg mb-4">Hosting Plan Governance</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-950 text-zinc-200 uppercase font-medium text-xs">
            <tr>
              <th className="px-4 py-3">Plan Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price (Locked)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {config.plans.map((plan) => (
              <tr key={plan.name} className="group hover:bg-zinc-900/50">
                <td className="px-4 py-3 font-medium text-white">{plan.name}</td>
                <td className="px-4 py-3 capitalize">{plan.type}</td>
                <td className="px-4 py-3 font-mono">₹{plan.priceMonthly}/mo</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    plan.enabled ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                  }`}>
                    {plan.enabled ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    plan.inviteOnly ? "bg-purple-900/30 text-purple-400" : "bg-blue-900/30 text-blue-400"
                  }`}>
                    {plan.inviteOnly ? "Invite Only" : "Public"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleToggleEnable(plan.name, plan.enabled)}
                      disabled={!!loading}
                      className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                      title={plan.enabled ? "Disable Plan" : "Enable Plan"}
                    >
                      {plan.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleToggleInvite(plan.name, plan.inviteOnly)}
                      disabled={!!loading}
                      className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                      title={plan.inviteOnly ? "Make Public" : "Make Invite Only"}
                    >
                      {plan.inviteOnly ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
