"use server";

import { ControlService, SystemFlagKey } from "@/lib/services/controlService";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
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

    const supabaseAdmin = await getSupabaseAdmin();

    const { error } = await supabaseAdmin
        .from('tenants')
        .update({ early_access: value })
        .eq('id', tenantId);

    if (error) throw error;
    
    revalidatePath("/admin/customers");
}

export async function updatePlanAction(planId: string, updates: Partial<any>) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const supabaseAdmin = await getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from('billing_plans')
    .update(updates as any)
    .eq('id', planId);

  if (error) throw error;
  revalidatePath("/admin/pricing");
}

export async function createPlanAction(plan: any) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Auto-generate ID if not present (simple slug)
  const planId = plan.id || `plan_${plan.product}_${plan.interval}_${Date.now().toString(36)}`;

  const supabaseAdmin = await getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from('billing_plans')
    .insert({ ...plan, id: planId });

  if (error) throw error;
  revalidatePath("/admin/pricing");
}

export async function updatePricingAction(pricingConfig: any) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const supabaseAdmin = await getSupabaseAdmin();

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
