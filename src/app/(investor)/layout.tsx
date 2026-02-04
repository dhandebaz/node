
import { InvestorSidebar } from "@/components/investor/layout/InvestorSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Nodebase Investor",
    default: "Nodebase Investor Portal",
  },
  description: "Secure infrastructure participation management.",
  robots: "noindex, nofollow", // Strict privacy
};

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex">
      <InvestorSidebar />
      <main className="flex-1 ml-64 min-h-screen bg-black relative">
        {/* Top Status Bar / Breadcrumbs could go here */}
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
