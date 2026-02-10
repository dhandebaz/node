'use server';

import { ControlService, SystemFlagKey } from "@/lib/services/controlService";
import { getSupabaseServer } from "@/lib/supabase/server";
import { WalletService } from "@/lib/services/walletService";
import { revalidatePath } from "next/cache";

export async function getLaunchData() {
  const flags = await ControlService.getSystemFlags();
  const supabase = await getSupabaseServer();
  
  // Get recent tenants
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, created_at, early_access, business_type')
    .order('created_at', { ascending: false })
    .limit(50);
    
  return { flags, tenants: tenants || [] };
}

export async function toggleSystemFlagAction(key: SystemFlagKey, value: boolean) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  await ControlService.toggleSystemFlag(key, value, user.id);
  revalidatePath('/admin/launch');
}

export async function toggleEarlyAccessAction(tenantId: string, enabled: boolean) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  await ControlService.toggleTenantControl(tenantId, 'early_access', enabled, user.id, "Launch Control Toggle");
  
  if (enabled) {
    // Check if bonus already given
    const hasBonus = await WalletService.hasTransactionType(tenantId, 'early_access_bonus');
    if (!hasBonus) {
      await WalletService.addCredits(tenantId, 1000, 'early_access_bonus', { reason: 'First 100 Users Bonus' });
    }
  }
  
  revalidatePath('/admin/launch');
}
