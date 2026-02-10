
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { MobileBottomNav } from "@/components/customer/MobileBottomNav";
import { getCustomerProfile } from "@/app/actions/customer";
import { kaisaService } from "@/lib/services/kaisaService";
import { redirect } from "next/navigation";
import { KaisaCreditUsage } from "@/types/kaisa";
import { FailureBanner } from "@/components/ui/FailureBanner";
import { StoreInitializer } from "@/components/dashboard/StoreInitializer";
import { EarlyAccessFeedback } from "@/components/dashboard/EarlyAccessFeedback";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const profile = await getCustomerProfile();
    
    // Onboarding Check
    if (profile.status.onboarding !== 'completed') {
      console.log(`[Layout] User ${profile.identity.id} onboarding pending. Redirecting to /onboarding.`);
      redirect('/onboarding');
    }

    // Business Type Check for AI Employees
    if (profile.roles.isKaisaUser && !profile.products.kaisa?.businessType) {
        console.log(`[Layout] User ${profile.identity.id} missing business type. Redirecting to repair.`);
        redirect('/onboarding?step=business_type');
    }

    console.log(`[Layout] User ${profile.identity.id} onboarding complete. Accessing dashboard.`);
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
        <main className="md:pl-64 min-h-screen pb-24 md:pb-0">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <FailureBanner />
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
        
        {/* Early Access Feedback (Only for Beta Users) */}
        {profile.tenant?.early_access && (
           <EarlyAccessFeedback />
        )}
      </div>
    );
  } catch (error) {
    // If auth fails, redirect to login
    redirect("/login");
  }
}
