"use server";

import { ControlService, SystemFlagKey } from "@/lib/services/controlService";
import { getSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleSystemFlagAction(key: SystemFlagKey, value: boolean) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  await ControlService.toggleSystemFlag(key, value, user.id);
  revalidatePath("/admin/launch");
}

export async function toggleTenantEarlyAccessAction(tenantId: string, value: boolean) {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) throw new Error("Unauthorized");

    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
        .from('tenants')
        .update({ early_access: value })
        .eq('id', tenantId);

    if (error) throw error;
    
    revalidatePath("/admin/customers");
}

export async function updatePricingAction(pricingConfig: any) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Using Admin client to bypass RLS if needed, or normal client if policy allows
  const { createClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('system_settings')
    .update({ 
      value: pricingConfig,
      updated_at: new Date().toISOString()
    })
    .eq('key', 'pricing_config');

  if (error) throw error;

  revalidatePath("/admin/pricing");
}
