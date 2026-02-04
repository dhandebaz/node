
"use client";

import { FeatureFlag } from "@/types/settings";
import { toggleFeatureAction } from "@/app/actions/settings";
import { useState } from "react";
import { Flag, ToggleLeft, ToggleRight } from "lucide-react";

export function FeatureFlagSettings({ features }: { features: FeatureFlag[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (id: string, current: boolean) => {
    setLoading(id);
    await toggleFeatureAction(id, !current);
    setLoading(null);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="font-medium text-white flex items-center gap-2 mb-6">
        <Flag className="w-5 h-5 text-amber-400" />
        Feature Flags
      </h3>

      <div className="space-y-0 divide-y divide-zinc-800 border border-zinc-800 rounded-lg bg-zinc-950/50">
        {features.map((feat) => (
          <div key={feat.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/30 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">{feat.name}</span>
                <span className="text-xs text-zinc-600 font-mono px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                    {feat.key}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-2">{feat.description}</p>
              
              <div className="flex gap-2">
                {feat.restrictedToRoles?.map(role => (
                    <span key={role} className="text-[10px] uppercase font-bold text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded">
                        Role: {role}
                    </span>
                ))}
                {feat.restrictedToProducts?.map(prod => (
                    <span key={prod} className="text-[10px] uppercase font-bold text-purple-400 bg-purple-900/20 px-1.5 py-0.5 rounded">
                        Product: {prod}
                    </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleToggle(feat.id, feat.enabled)}
              disabled={loading === feat.id}
              className={`ml-4 p-2 rounded transition-colors ${
                feat.enabled ? "text-green-400 hover:bg-green-900/20" : "text-zinc-600 hover:bg-zinc-800"
              }`}
            >
              {feat.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
