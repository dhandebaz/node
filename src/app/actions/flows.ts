
'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFlowsAction() {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('omni_flows')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('priority', { ascending: false });

  if (error) throw error;
  return data;
}

export async function saveFlowAction(flow: any) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  const { id, ...updates } = flow;

  let result;
  if (id) {
    result = await supabase
      .from('omni_flows')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId);
  } else {
    result = await supabase
      .from('omni_flows')
      .insert({ ...updates, tenant_id: tenantId });
  }

  if (result.error) throw result.error;
  revalidatePath("/dashboard/ai/flows");
  return { success: true };
}

export async function deleteFlowAction(id: string) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from('omni_flows')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) throw error;
  revalidatePath("/dashboard/ai/flows");
  return { success: true };
}
