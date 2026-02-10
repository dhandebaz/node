'use server';

import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { revalidatePath } from "next/cache";

export async function toggleBrandingAction(enabled: boolean) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();
  
  const { error } = await supabase
    .from("tenants")
    .update({ is_branding_enabled: enabled })
    .eq("id", tenantId);

  if (error) throw error;
    
  revalidatePath('/dashboard/ai/settings');
}
