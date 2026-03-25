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
      <div className="bg-card border border-border rounded-2xl p-8 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest text-foreground">AI Revenue Model</h2>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-60">Global usage & subscription rates</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Platform Access (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-mono text-lg">₹</span>
                <input 
                  type="number" 
                  value={pricing.ai_monthly_price}
                  onChange={(e) => setPricing({...pricing, ai_monthly_price: Number(e.target.value)})}
                  className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-xl font-black"
                />
              </div>
              <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-tight">Standard base fee for all active subscriptions.</p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit Cost per AI Execution (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-mono text-lg">₹</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={pricing.ai_message_cost}
                  onChange={(e) => setPricing({...pricing, ai_message_cost: Number(e.target.value)})}
                  className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-xl font-black"
                />
              </div>
              <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-tight">Variable cost deducted per generated AI interaction.</p>
            </div>
          </div>

          <div className="pt-10">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] text-xs shadow-lg shadow-primary/10"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Commit Pricing Structure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
