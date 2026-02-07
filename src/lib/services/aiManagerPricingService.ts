import { AiManager, PublicPricingItem } from "@/types/ai-managers";
import { getSupabaseServer } from "@/lib/supabase/server";

type AiManagerRow = {
  slug: string;
  name: string;
  audience: string | null;
  responsibility: string | null;
  status: AiManager["status"];
  base_monthly_price: number | null;
  integrations: string[] | null;
  features: string[] | null;
  updated_at?: string | null;
};

function mapManager(row: AiManagerRow): AiManager {
  return {
    slug: row.slug,
    name: row.name,
    audience: row.audience || "",
    responsibility: row.responsibility || "",
    status: row.status,
    baseMonthlyPrice: Number(row.base_monthly_price || 0),
    integrations: row.integrations || [],
    features: row.features || []
  };
}

export const aiManagerPricingService = {
  async getManagers(): Promise<AiManager[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("ai_managers")
      .select("slug, name, audience, responsibility, status, base_monthly_price, integrations, features, updated_at")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as AiManagerRow[]).map(mapManager);
  },

  async getManager(slug: string): Promise<AiManager | null> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("ai_managers")
      .select("slug, name, audience, responsibility, status, base_monthly_price, integrations, features, updated_at")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return null;
    }

    return mapManager(data as AiManagerRow);
  },

  async getPublicPricing(): Promise<PublicPricingItem[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("ai_managers")
      .select("slug, name, status, base_monthly_price")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as AiManagerRow[]).map((row) => ({
      slug: row.slug,
      name: row.name,
      status: row.status,
      baseMonthlyPrice: Number(row.base_monthly_price || 0)
    }));
  },

  async updatePricing(slug: string, baseMonthlyPrice: number, status: AiManager["status"]) {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("ai_managers")
      .update({
        base_monthly_price: baseMonthlyPrice,
        status,
        updated_at: new Date().toISOString()
      })
      .eq("slug", slug)
      .select("slug, name, audience, responsibility, status, base_monthly_price, integrations, features, updated_at")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update pricing");
    }

    return mapManager(data as AiManagerRow);
  }
};
