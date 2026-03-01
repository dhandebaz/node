export const dynamic = 'force-dynamic';

import { getCustomerProfile } from "@/app/actions/customer";
import { redirect } from "next/navigation";

export default async function CustomerDashboardPage() {
  // We don't even need to check profile anymore since we only have one product
  // But keeping the fetch ensures the user is authenticated
  await getCustomerProfile();
  
  // Always redirect to AI dashboard
  redirect("/dashboard/ai");
}
