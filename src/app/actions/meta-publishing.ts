"use server";

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";
import { MetaPublishingService } from "@/lib/services/metaPublishingService";
import { ThreadsService } from "@/lib/services/threadsService";
import { revalidatePath } from "next/cache";

export interface UnifiedPostParams {
  text: string;
  mediaUrl?: string; // Optional for FB/Threads, but required for IG media
  platforms: {
    facebook?: boolean;
    instagram?: boolean;
    threads?: boolean;
  };
}

export async function publishUnifiedPostAction(params: UnifiedPostParams) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  try {
    const { data: integration } = await supabase
      .from("integrations")
      .select("access_token, settings")
      .eq("tenant_id", tenantId)
      .eq("provider", "meta")
      .maybeSingle();

    if (!integration?.access_token) {
      return { success: false, error: "Meta integration not found. Please connect your account first." };
    }

    const { instagram_business_id, facebook_page_id, threads_user_id } = (integration.settings as any) || {};
    const results: Record<string, any> = {};

    // 1. Post to Facebook Page
    if (params.platforms.facebook && facebook_page_id) {
      results.facebook = await MetaPublishingService.publishPagePost(
        facebook_page_id,
        integration.access_token,
        params.text,
        params.mediaUrl
      );
    }

    // 2. Post to Instagram
    if (params.platforms.instagram && instagram_business_id && params.mediaUrl) {
      results.instagram = await MetaPublishingService.publishInstagramMedia(
        instagram_business_id,
        integration.access_token,
        { mediaUrl: params.mediaUrl, caption: params.text }
      );
    }

    // 3. Post to Threads
    if (params.platforms.threads && threads_user_id && params.mediaUrl) {
      results.threads = await ThreadsService.postThread(
        threads_user_id,
        integration.access_token,
        { mediaUrl: params.mediaUrl, text: params.text }
      );
    }

    revalidatePath("/dashboard/ai/content");
    return { success: true, results };
  } catch (error) {
    console.error("Unified Post Error:", error);
    return { success: false, error: (error as Error).message };
  }
}
