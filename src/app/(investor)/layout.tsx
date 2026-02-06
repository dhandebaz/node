
import { InvestorSidebar } from "@/components/investor/layout/InvestorSidebar";
import { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/lib/services/userService";

export const metadata: Metadata = {
  title: {
    template: "%s | Nodebase Investor",
    default: "Nodebase Investor Portal",
  },
  description: "Secure infrastructure participation management.",
  robots: "noindex, nofollow", // Strict privacy
};

export default async function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session ? await userService.getUserById(session.userId) : null;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex">
      <InvestorSidebar user={user} />
      <main className="flex-1 ml-64 min-h-screen bg-black relative">
        {/* Top Status Bar / Breadcrumbs could go here */}
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
