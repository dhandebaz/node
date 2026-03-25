
"use client";

import { FeatureFlag } from "@/types/settings";
import { toggleFeatureAction } from "@/app/actions/settings";
import { useState } from "react";
import { Flag, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeatureFlagSettings({ features }: { features: FeatureFlag[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (id: string, current: boolean) => {
    setLoading(id);
    await toggleFeatureAction(id, !current);
    setLoading(null);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm group">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center border border-warning/20 shadow-inner text-warning">
          <Flag className="w-5 h-5" />
        </div>
        Operational Toggles
      </h3>

      <div className="space-y-0 divide-y divide-border border border-border rounded-2xl bg-muted/20 overflow-hidden">
        {features.map((feat) => (
          <div key={feat.id} className="p-6 flex items-center justify-between hover:bg-muted/40 transition-colors group/feat">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-black uppercase tracking-widest text-foreground group-hover/feat:text-primary transition-colors">{feat.name}</span>
                <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest px-2 py-0.5 bg-muted rounded-lg border border-border">
                    {feat.key}
                </span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/60 mb-4">{feat.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {feat.restrictedToRoles?.map(role => (
                    <span key={role} className="text-[9px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        Auth: {role}
                    </span>
                ))}
                {feat.restrictedToProducts?.map(prod => (
                    <span key={prod} className="text-[9px] uppercase font-black tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded-lg border border-accent/20">
                        Scope: {prod}
                    </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleToggle(feat.id, feat.enabled)}
              disabled={loading === feat.id}
              className={cn(
                "ml-6 p-2 rounded-xl transition-all active:scale-90",
                feat.enabled ? "text-success hover:bg-success/10" : "text-muted-foreground/30 hover:bg-muted"
              )}
            >
              {feat.enabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
