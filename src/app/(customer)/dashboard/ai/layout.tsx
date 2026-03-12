
import { ListingsGate } from "@/components/dashboard/ListingsGate";
import { getActiveTenantId } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AIDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenantId = await getActiveTenantId();
  if (!tenantId) redirect("/onboarding");

  // 2. Fetch listings count
  let listingsCount = 0;
  const supabase = await getSupabaseServer();
  const { count, error } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId);
  
  if (!error && count !== null) {
    listingsCount = count;
  }

  return (
    <>
      <ListingsGate listingsCount={listingsCount} />
      {children}
    </>
  );
}
