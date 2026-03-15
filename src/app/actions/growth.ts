"use server";

import { requireActiveTenant } from "@/lib/auth/tenant";
import { GrowthService } from "@/lib/services/growthService";
import { getSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function scanForOpportunitiesAction() {
  const tenantId = await requireActiveTenant();
  return await GrowthService.generateLeadOpportunities(tenantId);
}

export async function approveLeadAction(opportunityId: string) {
  const tenantId = await requireActiveTenant();

  // Verify the opportunity belongs to this tenant before acting
  const supabase = await getSupabaseServer();
  const { data: opportunity, error: fetchError } = await supabase
    .from("lead_opportunities")
    .select("id, tenant_id, status")
    .eq("id", opportunityId)
    .eq("tenant_id", tenantId)
    .single();

  if (fetchError || !opportunity) {
    throw new Error("Opportunity not found or access denied");
  }

  if (opportunity.status === "sent") {
    throw new Error("This opportunity has already been sent");
  }

  // Delegate to GrowthService which handles message composition,
  // conversation creation, WAHA/channel delivery, and status update atomically
  const result = await GrowthService.approveAndSendOpportunity(opportunityId);

  revalidatePath("/dashboard/ai/growth");
  return result;
}

export async function getGrowthDataAction() {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  const [campaigns, opportunities] = await Promise.all([
    supabase
      .from("growth_campaigns")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false }),
    supabase
      .from("lead_opportunities")
      .select("*, guests(name, phone), listings(title)")
      .eq("tenant_id", tenantId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  return {
    campaigns: campaigns.data || [],
    opportunities: (opportunities.data || []).map((o: any) => ({
      id: o.id,
      guestName: o.guests?.name || "Guest",
      guestPhone: o.guests?.phone || "N/A",
      listingTitle: o.listings?.title || "Listing",
      message: o.suggested_message,
      type: o.opportunity_type,
      metadata: o.metadata,
    })),
  };
}
