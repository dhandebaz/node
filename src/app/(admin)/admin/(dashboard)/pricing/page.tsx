import { getSupabaseServer } from "@/lib/supabase/server";
import { PricingEditor } from "@/components/admin/pricing/PricingEditor";
import { PlansEditor } from "@/components/admin/pricing/PlansEditor";
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
    .order('price', { ascending: true });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-brand-red" />
          Pricing & Plans
        </h1>
        <p className="text-zinc-400">
          Manage subscription plans and the underlying AI cost model.
        </p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-6">
            <Tag className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Subscription Plans</h2>
        </div>
        <PlansEditor plans={plans || []} />
      </section>

      <section className="pt-8 border-t border-zinc-800">
        <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold text-white">AI Cost Model</h2>
        </div>
        <PricingEditor config={config} />
      </section>
    </div>
  );
}
