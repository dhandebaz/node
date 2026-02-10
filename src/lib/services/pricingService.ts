import { getSupabaseServer } from "@/lib/supabase/server";

export interface PricingRules {
  per_1k_tokens: number;
  action_multipliers: Record<string, number>;
  persona_multipliers?: Record<string, number>;
}

const DEFAULT_PRICING: PricingRules = {
  per_1k_tokens: 0.002,
  action_multipliers: {
    ai_reply: 1.0,
    availability_check: 2.0,
    calendar_sync: 0.5,
    gmail_sync: 1.5,
    memory_read: 0.1,
    memory_write: 5.0,
    default: 1.0
  },
  persona_multipliers: {
    airbnb_host: 1.0,
    kirana_store: 0.8,
    doctor_clinic: 1.2,
    thrift_store: 0.9,
    default: 1.0
  }
};

export class PricingService {
  static async getRules(): Promise<PricingRules> {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "pricing_rules")
      .single();

    if (!data?.value) return DEFAULT_PRICING;
    // Merge with default to ensure new fields exist if old data
    return { ...DEFAULT_PRICING, ...data.value } as PricingRules;
  }

  static async updateRules(newRules: Partial<PricingRules>): Promise<PricingRules> {
    const supabase = await getSupabaseServer();
    const current = await this.getRules();
    
    const updated = { ...current, ...newRules };
    
    const { error } = await supabase
      .from("system_settings")
      .upsert({
        key: "pricing_rules",
        value: updated,
        updated_at: new Date().toISOString()
      });

    if (error) throw new Error("Failed to update pricing rules: " + error.message);
    
    return updated;
  }

  static async calculateCost(actionType: string, tokensUsed: number, tenantId?: string): Promise<number> {
    const rules = await this.getRules();
    const actionMultiplier = rules.action_multipliers[actionType] || rules.action_multipliers.default || 1.0;
    
    let personaMultiplier = 1.0;
    if (tenantId && rules.persona_multipliers) {
      const supabase = await getSupabaseServer();
      const { data } = await supabase
        .from('tenants')
        .select('business_type')
        .eq('id', tenantId)
        .single();
      
      const type = data?.business_type || 'default';
      personaMultiplier = rules.persona_multipliers[type] || rules.persona_multipliers.default || 1.0;
    }
    
    // Cost = (Tokens / 1000) * BaseRate * ActionMultiplier * PersonaMultiplier
    const cost = (tokensUsed / 1000) * rules.per_1k_tokens * actionMultiplier * personaMultiplier;
    
    return Math.max(0.0001, Number(cost.toFixed(6)));
  }
}
