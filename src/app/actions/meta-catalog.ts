"use server";

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";
import { MetaCatalogService, MetaProductParams } from "@/lib/services/metaCatalogService";
import { revalidatePath } from "next/cache";

export async function getMetaCatalogsAction() {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  try {
    const { data: integration } = await supabase
      .from("integrations")
      .select("access_token, settings")
      .eq("tenant_id", tenantId)
      .eq("provider", "meta")
      .maybeSingle();

    if (!integration?.access_token) throw new Error("Meta integration not found");

    const { facebook_business_id } = (integration.settings as any) || {};
    if (!facebook_business_id) throw new Error("Meta Business ID missing in integration settings");

    return await MetaCatalogService.getCatalogs(facebook_business_id, integration.access_token);
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function syncCatalogAction(catalogId: string) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  try {
    // 1. Get Integration
    const { data: integration } = await supabase
      .from("integrations")
      .select("access_token, settings")
      .eq("tenant_id", tenantId)
      .eq("provider", "meta")
      .maybeSingle();

    if (!integration?.access_token) throw new Error("Meta integration not found");

    // 2. Fetch Listings
    const { data: listings } = await supabase
      .from("listings")
      .select("*")
      .eq("tenant_id", tenantId);

    if (!listings || listings.length === 0) {
      return { success: true, message: "No listings found to sync." };
    }

    // 3. Map to Meta Format
    const products: MetaProductParams[] = listings.map((l: any) => ({
      id: l.id,
      name: l.title,
      description: l.description || "",
      availability: "in stock", // Simplified
      condition: "new",
      price: l.base_price || 0,
      currency: "INR", // Simplified
      image_url: l.images?.[0] || "",
      url: `https://nodebase.ai/listings/${l.id}`, // Placeholder
      brand: "Nodebase"
    }));

    // 4. Batch Upload
    const result = await MetaCatalogService.batchUpload(catalogId, integration.access_token, products);

    if (result.success) {
      await supabase.from("integrations").update({
        settings: { 
            ...(integration.settings as any),
            last_catalog_sync_at: new Date().toISOString(),
            active_catalog_id: catalogId
        }
      }).eq("tenant_id", tenantId).eq("provider", "meta");
      
      revalidatePath("/dashboard/ai/catalog");
    }

    return result;
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
