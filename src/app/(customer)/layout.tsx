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
      <div className="flex h-screen overflow-hidden bg-background selection:bg-primary selection:text-primary-foreground font-sans">
        <StoreInitializer tenant={profile.tenant} />

        {/* Sidebar Navigation (Desktop) */}
        <DashboardSidebar />

        <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
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

          {/* Main Content Canvas (Scrollable independently, distinct subtle background) */}
          <main className="flex-1 overflow-y-auto bg-muted/20 relative custom-scrollbar">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
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
