"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, Loader2, Sparkles } from "lucide-react";
import { fetchWithAuth } from "@/lib/api/fetcher";

interface PricingConfig {
  ai_monthly_price: number;
  ai_message_cost: number;
}

export function PricingEditor({ config }: { config: any }) {
  // Fallback to defaults if not set
  const [pricing, setPricing] = useState<PricingConfig>({
    ai_monthly_price: config?.ai_monthly_price || 1999,
    ai_message_cost: config?.ai_message_cost || 1
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      // We pass it as a partial update to the system settings
      // The action expects the full object or partial, but our new requirement
      // is specifically for these two fields.
      // We might need to adjust updatePricingAction or create a new one.
      // For now, assuming updatePricingAction accepts arbitrary object which is saved.
      // BUT the prompt said: "push this payload ... to /api/admin/pricing/update"
      // Let's use fetch directly to the route as requested by the prompt structure 
      // or use the action if it wraps the route.
      // The prompt said: "Call the updateHostUPIAction server action... Open src/app/api/admin/pricing/update/route.ts ... Update the logic"
      // So we should probably use the API route directly here for clarity or update the action.
      // Let's use fetch for the route as explicitly mentioned in step 4 context.
      
      await fetchWithAuth("/api/admin/pricing/update", {
        method: "POST",
        body: JSON.stringify(pricing)
      });

      toast.success("AI SaaS Pricing updated");
    } catch (error) {
      toast.error("Failed to update pricing");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center border border-brand-red/20">
              <Sparkles className="w-6 h-6 text-brand-red" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI SaaS Pricing</h2>
              <p className="text-zinc-400 text-sm">Configure global subscription & usage rates</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Monthly Subscription Price (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">₹</span>
                <input 
                  type="number" 
                  value={pricing.ai_monthly_price}
                  onChange={(e) => setPricing({...pricing, ai_monthly_price: Number(e.target.value)})}
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all font-mono text-lg"
                />
              </div>
              <p className="text-xs text-zinc-500">Base monthly fee for platform access.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Price per AI Reply (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">₹</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={pricing.ai_message_cost}
                  onChange={(e) => setPricing({...pricing, ai_message_cost: Number(e.target.value)})}
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all font-mono text-lg"
                />
              </div>
              <p className="text-xs text-zinc-500">Cost deducted from wallet for each generated reply.</p>
            </div>
          </div>

          <div className="pt-8">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-red-600 text-white px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-brand-red/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Update Global Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
