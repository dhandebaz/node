import { UniversalNavbar } from "@/components/layout/UniversalNavbar";
import { VerificationGate } from "@/components/auth/VerificationGate";
import { getCustomerProfile } from "@/app/actions/customer";
import { omniService } from "@/lib/services/omniService";
import { redirect } from "next/navigation";
import { OmniCreditUsage } from "@/types/omni";
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
    if (profile.status.onboarding !== "completed") {
      redirect("/onboarding");
    }

    if (!profile.tenant && !profile.roles.isAdmin) {
      redirect("/onboarding");
    }

    // Business Type Check for AI Employees
    const resolvedBusinessType =
      profile.products.omni?.businessType || profile.tenant?.businessType;
    if (profile.roles.isOmniUser && !resolvedBusinessType) {
      redirect("/onboarding?step=business_type");
    }

    let omniCredits: OmniCreditUsage | null = null;

    if (profile.roles.isOmniUser) {
      try {
        omniCredits = await omniService.getCreditUsage(
          profile.identity.id,
          profile.tenant?.id,
        );
      } catch (e) {
        console.error("Failed to fetch omni credits for layout", e);
      }
    }

    return (
      <div className="flex h-screen overflow-hidden bg-white text-zinc-950 selection:bg-blue-100 font-sans">
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
            userAvatar={undefined}
            credits={omniCredits}
            isOmniUser={profile.roles.isOmniUser}
          />

          {/* Main Content Canvas */}
          <main className="flex-1 overflow-y-auto bg-zinc-50 relative custom-scrollbar">
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

        {/* Early Access Feedback */}
        {profile.tenant?.earlyAccess && <EarlyAccessFeedback />}

        <MobileBottomNav />
      </div>
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Layout Error - Redirecting to login:", error);
    redirect("/login");
  }
}
