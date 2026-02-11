
import { ListingsGate } from "@/components/dashboard/ListingsGate";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function AIDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get current tenant
  let tenantId;
  try {
    tenantId = await requireActiveTenant();
  } catch (error) {
    // If no tenant, maybe redirect to login or handle gracefully
    // But typically middleware/layout handles auth.
    // For now, let's assume if we are here, we are logged in.
    // If requireActiveTenant fails, it might mean setup is incomplete.
    console.error("Failed to get active tenant:", error);
    // fallback or rethrow? 
    // If we can't get tenant, we can't fetch listings.
    // Let's assume 0 listings if tenant fails, effectively gating them.
  }

  // 2. Fetch listings count
  let listingsCount = 0;
  if (tenantId) {
    const supabase = await getSupabaseServer();
    const { count, error } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);
    
    if (!error && count !== null) {
      listingsCount = count;
    }
  }

  return (
    <>
      <ListingsGate listingsCount={listingsCount} />
      {children}
    </>
  );
}
