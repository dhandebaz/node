import { UniversalNavbar } from "@/components/layout/UniversalNavbar";
import { VerificationGate } from "@/components/auth/VerificationGate";
import { getCustomerProfile } from "@/app/actions/customer";
import { kaisaService } from "@/lib/services/kaisaService";
import { redirect } from "next/navigation";
import { KaisaCreditUsage } from "@/types/kaisa";
import { FailureBanner } from "@/components/ui/FailureBanner";
import { StoreInitializer } from "@/components/dashboard/StoreInitializer";
import { EarlyAccessFeedback } from "@/components/dashboard/EarlyAccessFeedback";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

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
    if (profile.status.onboarding !== "completed") {
      console.log(
        `[CustomerLayout] Redirecting to onboarding: status is ${profile.status.onboarding}`,
      );
      redirect("/onboarding");
    }

    if (!profile.tenant && !profile.roles.isAdmin) {
      console.log(
        `[CustomerLayout] Redirecting to onboarding: tenant is missing and user is not admin`,
      );
      redirect("/onboarding");
    }

    // Business Type Check for AI Employees
    const resolvedBusinessType =
      profile.products.kaisa?.businessType || profile.tenant?.businessType;
    if (profile.roles.isKaisaUser && !resolvedBusinessType) {
      redirect("/onboarding?step=business_type");
    }

    let kaisaCredits: KaisaCreditUsage | null = null;

    if (profile.roles.isKaisaUser) {
      try {
        // Safe fetch - don't block UI if this fails
        // Optimization: Pass tenant ID to avoid redundant DB lookup
        kaisaCredits = await kaisaService.getCreditUsage(
          profile.identity.id,
          profile.tenant?.id,
        );
      } catch (e) {
        console.error("Failed to fetch kaisa credits for layout", e);
      }
    }

    return (
      <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground font-sans">
        <StoreInitializer tenant={profile.tenant} />

        {/* Universal Top Navigation */}
        <UniversalNavbar
          tenantName={
            profile.tenant?.name || profile.profile?.fullName || "My Business"
          }
          userEmail={profile.identity.email}
          userAvatar={undefined} // Add avatar URL if available in profile
          credits={kaisaCredits}
          isKaisaUser={profile.roles.isKaisaUser}
        />

        <div className="flex">
          {/* Sidebar Navigation (Desktop) */}
          <DashboardSidebar />

          {/* Main Content - Adjusted for fixed header and sidebar */}
          <main className="flex-1 pt-20 min-h-screen pb-24 md:pb-0 transition-all duration-300 md:pl-[var(--sidebar-width,0px)]">
            <div className="max-w-7xl mx-auto p-6 md:p-10">
              <FailureBanner />
              <VerificationGate
                kycStatus={profile.tenant?.kyc_status || "not_started"}
              >
                {children}
              </VerificationGate>
            </div>
          </main>
        </div>

        {/* Early Access Feedback (Only for Beta Users) */}
        {profile.tenant?.earlyAccess && <EarlyAccessFeedback />}

        <MobileBottomNav />
      </div>
    );
  } catch (error: unknown) {
    // If we catch a redirect, let it pass
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Layout Error - Redirecting to login:", error);
    redirect("/login");
  }
}
