
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { getCustomerProfile } from "@/app/actions/customer";
import { redirect } from "next/navigation";

export default async function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCustomerProfile().catch(() => null);

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black flex">
      <CustomerSidebar roles={profile.roles} products={profile.products} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
