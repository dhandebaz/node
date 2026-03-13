import { getSupabaseServer } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getSession() {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Try to get tenant ID from cookie first (fastest)
    const cookieStore = await cookies();
    let tenantId = cookieStore.get('nodebase-tenant-id')?.value;

    // If no cookie, try to resolve from DB (slower but robust)
    if (!tenantId) {
      const { data } = await supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      tenantId = data?.tenant_id;
    }

    return {
      userId: user.id,
      role: user.user_metadata?.role || "customer",
      email: user.email,
      tenantId
    };
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  try {
    const supabase = await getSupabaseServer();
    await supabase.auth.signOut();
    
    // Clear tenant cookie
    const cookieStore = await cookies();
    cookieStore.delete('nodebase-tenant-id');
  } catch (error) {
    console.error("Error signing out:", error);
  }
}
