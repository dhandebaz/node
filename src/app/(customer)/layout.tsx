
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { MobileBottomNav } from "@/components/customer/MobileBottomNav";
import { getCustomerProfile } from "@/app/actions/customer";
import { kaisaService } from "@/lib/services/kaisaService";
import { redirect } from "next/navigation";
import { KaisaCreditUsage } from "@/types/kaisa";
import { FailureBanner } from "@/components/ui/FailureBanner";
import { StoreInitializer } from "@/components/dashboard/StoreInitializer";
import { EarlyAccessFeedback } from "@/components/dashboard/EarlyAccessFeedback";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const profile = await getCustomerProfile();
    
    // Onboarding Check
    if (profile.status.onboarding !== 'completed') {
      redirect('/onboarding');
    }

    // Business Type Check for AI Employees
    if (profile.roles.isKaisaUser && !profile.products.kaisa?.businessType) {
        redirect('/onboarding?step=business_type');
    }

    let kaisaCredits: KaisaCreditUsage | null = null;

    if (profile.roles.isKaisaUser) {
        try {
            kaisaCredits = await kaisaService.getCreditUsage(profile.identity.id);
        } catch (e) {
            console.error("Failed to fetch kaisa credits for layout", e);
        }
    }

    return (
      <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 selection:bg-[var(--color-brand-red)] selection:text-white font-sans">
        <StoreInitializer tenant={profile.tenant} />
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <CustomerSidebar 
              roles={profile.roles} 
              products={profile.products} 
              kaisaCredits={kaisaCredits}
              tenant={profile.tenant}
          />
        </div>

        {/* Main Content */}
        <main className="md:pl-64 min-h-screen pb-24 md:pb-0 transition-all duration-300">
          <div className="max-w-7xl mx-auto p-6 md:p-10">
            <FailureBanner />
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
        
        {/* Early Access Feedback (Only for Beta Users) */}
        {profile.tenant?.earlyAccess && (
           <EarlyAccessFeedback />
        )}
      </div>
    );
  } catch (error) {
    console.error("Layout Error - Redirecting to login:", error);
    redirect("/login");
  }
}
