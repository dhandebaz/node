
'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { RevenueService } from "@/lib/services/revenueService";
import { getSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function generatePriceSuggestionsAction(listingId: string) {
  const tenantId = await requireActiveTenant();
  const suggestions = await RevenueService.generatePriceSuggestions(tenantId, listingId);
  await RevenueService.saveSuggestions(tenantId, listingId, suggestions);
  
  revalidatePath(`/dashboard/ai/listings/${listingId}`);
  return { count: suggestions.length };
}

export async function applyPriceSuggestionAction(suggestionId: string) {
  const tenantId = await requireActiveTenant();
  await RevenueService.applySuggestion(suggestionId);
  
  revalidatePath(`/dashboard/ai/revenue`);
  return { success: true };
}

export async function getRevenueDataAction(listingId?: string) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('price_suggestions')
    .select('*, listings(title)')
    .eq('tenant_id', tenantId)
    .eq('status', 'pending')
    .order('date', { ascending: true });

  if (listingId) {
    query = query.eq('listing_id', listingId);
  }

  const { data: suggestions, error } = await query;

  if (error) throw new Error(error.message);

  return {
    suggestions: (suggestions || []).map((s: any) => ({
      id: s.id,
      listingTitle: s.listings?.title || "Listing",
      date: s.date,
      suggestedPrice: s.suggested_price,
      currentPrice: s.current_price,
      reason: s.reason,
      confidence: s.confidence
    }))
  };
}
