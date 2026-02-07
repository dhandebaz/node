
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { MobileBottomNav } from "@/components/customer/MobileBottomNav";
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
      <div className="min-h-screen bg-[var(--color-brand-red)] text-white selection:bg-white selection:text-[var(--color-brand-red)]">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <CustomerSidebar 
              roles={profile.roles} 
              products={profile.products} 
              kaisaCredits={kaisaCredits}
          />
        </div>

        {/* Main Content */}
        <main className="md:pl-64 min-h-screen pb-24 md:pb-0">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
      </div>
    );
  } catch (error) {
    // If auth fails, redirect to login
    redirect("/login");
  }
}
