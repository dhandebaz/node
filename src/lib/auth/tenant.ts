import { cookies } from 'next/headers';
import { getSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Retrieves the active tenant ID for the current request.
 * Priority:
 * 1. Cookie (set by middleware) - Fastest, zero DB latency
 * 2. DB Lookup (fallback) - Slower, ensures correctness if cookie missing
 */
export async function getActiveTenantId(): Promise<string | null> {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get('nodebase-tenant-id')?.value;
  
  // Middleware should have set this, so this is the happy path
  if (tenantId) return tenantId;

  // Fallback: If middleware didn't run or cookie expired/missing
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    
    return data.tenant_id;
  } catch (error) {
    console.error("Error resolving tenant:", error);
    return null;
  }
}

/**
 * STRICTLY requires an active tenant.
 * If missing, it implies the user is not onboarded or auth is broken.
 * In Server Actions: Throw error.
 * In Server Components: You might want to redirect to /onboarding manually if this fails.
 */
export async function requireActiveTenant(): Promise<string> {
  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    // If we are in a context where we can redirect (Server Component), 
    // we could, but throwing allows the caller to decide (e.g. API route vs Page).
    // However, for safety in critical actions, we throw.
    throw new Error("Active Tenant Context Missing - User may not be onboarded");
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
    .select("*")
    .eq("id", tenantId)
    .single();
    
  if (error || !tenant) return null;
  
  return {
    ...tenant,
    businessType: tenant.business_type // Alias for easier access
  };
}

/**
 * Validates that the current user actually has access to the requested tenant.
 * Useful for critical operations where we don't want to rely solely on RLS for the 'active' check.
 */
export async function validateTenantAccess(tenantId: string): Promise<boolean> {
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
