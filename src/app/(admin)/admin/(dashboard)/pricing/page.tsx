import { getSupabaseServer } from "@/lib/supabase/server";
import { PricingEditor } from "@/components/admin/pricing/PricingEditor";
import { PlansEditor } from "@/components/admin/pricing/PlansEditor";
import { BillingPlan } from "@/types/billing";
import { DollarSign, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const supabase = await getSupabaseServer();
  
  // 1. Get Cost Config
  const { data: configData } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'pricing_config')
    .single();

  const config = configData?.value || { 
    per_1k_tokens: 5, 
    multipliers: { ai_reply: 1.0, calendar_sync: 0.5, availability_check: 2.0 } 
  };

  // 2. Get Plans
  const { data: plans } = await supabase
    .from('billing_plans')
    .select('*')
    .order('price', { ascending: true }) as { data: BillingPlan[] | null };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Pricing <span className="text-primary/40">& Revenue</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Subscription tiers & algorithmic cost orchestration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm group">
          <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Subscription_Substrate</h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Registry of all authorized billing tiers</p>
            </div>
            <Tag className="w-4 h-4 text-muted-foreground/20" />
          </div>
          <div className="p-8">
            <PlansEditor plans={plans || []} />
          </div>
        </section>

        <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm group border-dashed">
          <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Ai_Compute_Model</h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Algorithmic token valuation & margin tuning</p>
            </div>
            <DollarSign className="w-4 h-4 text-muted-foreground/20" />
          </div>
          <div className="p-8">
            <PricingEditor config={config} />
          </div>
        </section>
      </div>
    </div>
  );
}
