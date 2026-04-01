"use server";

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";
import { MetaMarketingService } from "@/lib/services/metaMarketingService";
import { revalidatePath } from "next/cache";

export async function getMetaCampaignsAction(adAccountId: string) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  try {
    const { data: integration } = await supabase
      .from("integrations")
      .select("access_token")
      .eq("tenant_id", tenantId)
      .eq("provider", "meta")
      .maybeSingle();

    if (!integration?.access_token) {
      return { success: false, error: "Meta integration not found or disconnected" };
    }

    return await MetaMarketingService.getCampaigns(adAccountId, integration.access_token);
  } catch (error) {
    console.error("Get Meta Campaigns Error:", error);
    return { success: false, error: "Failed to fetch campaigns" };
  }
}

export async function updateCampaignStatusAction(campaignId: string, status: "ACTIVE" | "PAUSED") {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  try {
    const { data: integration } = await supabase
      .from("integrations")
      .select("access_token")
      .eq("tenant_id", tenantId)
      .eq("provider", "meta")
      .maybeSingle();

    if (!integration?.access_token) throw new Error("Integration not found");

    const result = await MetaMarketingService.updateCampaignStatus(campaignId, integration.access_token, status);
    if (result.success) {
      revalidatePath("/dashboard/ai/marketing");
    }
    return result;
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAdInsightsAction(id: string) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  try {
    const { data: integration } = await supabase
      .from("integrations")
      .select("access_token")
      .eq("tenant_id", tenantId)
      .eq("provider", "meta")
      .maybeSingle();

    if (!integration?.access_token) throw new Error("Integration not found");

    return await MetaMarketingService.getInsights(id, integration.access_token);
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getMetaLeadsAction(formId: string) {
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseServer();
  
    try {
      const { data: integration } = await supabase
        .from("integrations")
        .select("access_token")
        .eq("tenant_id", tenantId)
        .eq("provider", "meta")
        .maybeSingle();
  
      if (!integration?.access_token) throw new Error("Integration not found");
  
      return await MetaMarketingService.getLeads(formId, integration.access_token);
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
}
