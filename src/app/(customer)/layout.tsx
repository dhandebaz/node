
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { getCustomerProfile } from "@/app/actions/customer";
import { kaisaService } from "@/lib/services/kaisaService";
import { redirect } from "next/navigation";
import { KaisaCreditUsage } from "@/types/kaisa";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const profile = await getCustomerProfile();
    let kaisaCredits: KaisaCreditUsage | null = null;

    if (profile.roles.isKaisaUser) {
        try {
            kaisaCredits = await kaisaService.getCreditUsage(profile.identity.id);
        } catch (e) {
            console.error("Failed to fetch kaisa credits for layout", e);
        }
    }

    return (
      <div className="min-h-screen bg-black text-white selection:bg-brand-saffron/30">
        <CustomerSidebar 
            roles={profile.roles} 
            products={profile.products} 
            kaisaCredits={kaisaCredits}
        />
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
