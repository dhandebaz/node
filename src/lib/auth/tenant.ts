import { cookies } from 'next/headers';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function getActiveTenantId(): Promise<string | null> {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get('nodebase-tenant-id')?.value;
  return tenantId || null;
}

export async function requireActiveTenant() {
  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    throw new Error("Active Tenant Context Missing");
  }
  return tenantId;
}

/**
 * Gets the full tenant context including business type.
 * Useful for checking business rules without needing full user profile.
 */
export async function getTenantContext(tenantId: string) {
  const supabase = await getSupabaseServer();
  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*, business_type")
    .eq("id", tenantId)
    .single();
    
  if (error || !tenant) return null;
  
  return {
    ...tenant,
    businessType: tenant.business_type
  };
}

/**
 * Validates that the current user actually has access to the requested tenant.
 * Useful for critical operations where we don't want to rely solely on RLS for the 'active' check.
 */
export async function validateTenantAccess(tenantId: string) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data, error } = await supabase
    .from('tenant_users')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return false;
  return true;
}
