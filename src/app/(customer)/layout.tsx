
import { UniversalNavbar } from "@/components/layout/UniversalNavbar";
import { VerificationGate } from "@/components/auth/VerificationGate";
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
    // Note: Middleware handles basic routing, but this double-check ensures data integrity
    if (profile.status.onboarding !== 'completed') {
      redirect('/onboarding');
    }
    
    if (!profile.tenant && !profile.roles.isAdmin) {
      redirect('/onboarding');
    }

    // Business Type Check for AI Employees
    if (profile.roles.isKaisaUser && !profile.products.kaisa?.businessType) {
        redirect('/onboarding?step=business_type');
    }

    let kaisaCredits: KaisaCreditUsage | null = null;

    if (profile.roles.isKaisaUser) {
        try {
            // Safe fetch - don't block UI if this fails
            // Optimization: Pass tenant ID to avoid redundant DB lookup
            kaisaCredits = await kaisaService.getCreditUsage(
                profile.identity.id, 
                profile.tenant?.id
            );
        } catch (e) {
            console.error("Failed to fetch kaisa credits for layout", e);
        }
    }

    return (
      <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 selection:bg-[var(--color-brand-red)] selection:text-white font-sans">
        <StoreInitializer tenant={profile.tenant} />
        
        {/* Universal Top Navigation */}
        <UniversalNavbar 
          tenantName={profile.tenant?.name || profile.profile?.fullName || "My Business"}
          userEmail={profile.identity.email}
          userAvatar={profile.profile?.avatarUrl}
          credits={kaisaCredits}
          isKaisaUser={profile.roles.isKaisaUser}
        />

        {/* Main Content - Adjusted for fixed header */}
        <main className="pt-20 min-h-screen pb-24 md:pb-0 transition-all duration-300">
          <div className="max-w-7xl mx-auto p-6 md:p-10">
            <FailureBanner />
            <VerificationGate kycStatus={profile.tenant?.kyc_status || 'not_started'}>
              {children}
            </VerificationGate>
          </div>
        </main>
        
        {/* Early Access Feedback (Only for Beta Users) */}
        {profile.tenant?.earlyAccess && (
           <EarlyAccessFeedback />
        )}
      </div>
    );
  } catch (error: any) {
    // If we catch a redirect, let it pass
    if (error?.message === "NEXT_REDIRECT") {
        throw error;
    }
    
    console.error("Layout Error - Redirecting to login:", error);
    redirect("/login");
  }
}
