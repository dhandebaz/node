"use client";

import { useState } from "react";
import { updatePricingAction } from "@/app/actions/admin";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

interface PricingConfig {
  per_1k_tokens: number;
  multipliers: {
    ai_reply: number;
    calendar_sync: number;
    availability_check: number;
    [key: string]: number;
  };
}

export function PricingEditor({ config }: { config: PricingConfig }) {
  const [pricing, setPricing] = useState<PricingConfig>(config);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updatePricingAction(pricing);
      toast.success("Pricing configuration updated");
    } catch (error) {
      toast.error("Failed to update pricing");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Base Rate */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Base Costs</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Cost per 1,000 Tokens (Credits)
            </label>
            <input 
              type="number" 
              value={pricing.per_1k_tokens}
              onChange={(e) => setPricing({...pricing, per_1k_tokens: Number(e.target.value)})}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Base unit cost for AI inference. 1 Credit = 1 INR (approx).
            </p>
          </div>
        </div>
      </div>

      {/* Multipliers */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Action Multipliers</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(pricing.multipliers).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-zinc-400 mb-2 capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <input 
                type="number" 
                step="0.1"
                value={value}
                onChange={(e) => setPricing({
                  ...pricing, 
                  multipliers: {
                    ...pricing.multipliers,
                    [key]: Number(e.target.value)
                  }
                })}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
              />
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        Save Changes
      </button>
    </div>
  );
}
