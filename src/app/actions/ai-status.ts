"use server";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/auth/tenant";
import { revalidatePath } from "next/cache";
import { completeMilestone } from "./onboarding";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

export async function toggleAiAction(enabled: boolean) {
  const tenantId = await getActiveTenantId();
  if (!tenantId) throw new Error("Unauthorized");

  const admin = await getSupabaseAdmin();

  const { error } = await admin
    .from("tenants")
    .update({ is_ai_enabled: enabled })
    .eq("id", tenantId);

  if (error) throw new Error("Failed to update AI status");

  if (enabled) {
    await completeMilestone("enable_ai");
  }

  await logEvent({
    tenant_id: tenantId,
    actor_type: 'user',
    event_type: EVENT_TYPES.AI_SETTINGS_CHANGED,
    entity_type: 'tenant',
    entity_id: tenantId,
    metadata: { is_ai_enabled: enabled, source: 'settings_toggle' }
  });

  revalidatePath("/dashboard/ai/settings");
  revalidatePath("/dashboard/ai");
  
  return { success: true };
}
