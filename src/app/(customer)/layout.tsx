
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { getCustomerProfile } from "@/app/actions/customer";
import { redirect } from "next/navigation";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const profile = await getCustomerProfile();

    return (
      <div className="min-h-screen bg-black text-white selection:bg-brand-saffron/30">
        <CustomerSidebar roles={profile.roles} products={profile.products} />
        <main className="pl-64 min-h-screen">
          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    // If auth fails, redirect to login
    redirect("/login");
  }
}
