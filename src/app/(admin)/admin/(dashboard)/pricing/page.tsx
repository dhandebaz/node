import { getSupabaseServer } from "@/lib/supabase/server";
import { PricingEditor } from "@/components/admin/pricing/PricingEditor";
import { DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'pricing_config')
    .single();

  const config = data?.value || { 
    per_1k_tokens: 5, 
    multipliers: { ai_reply: 1.0, calendar_sync: 0.5, availability_check: 2.0 } 
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-brand-red" />
          Pricing & Costs
        </h1>
        <p className="text-zinc-400">
          Configure the base cost model for the AI engine. Changes apply immediately to all tenants.
        </p>
      </div>

      <PricingEditor config={config} />
    </div>
  );
}
