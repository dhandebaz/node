import type { Metadata } from "next";
import { IndustryDetail } from "@/components/public-site/IndustryDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI for Legal | NodeBase Counsel AI",
  description:
    "Automate client intake, consultation scheduling, and case updates for your law firm with NodeBase's Counsel AI.",
  openGraph: {
    title: "AI for Legal | NodeBase",
    description:
      "Counsel AI handles client intake, bookings, and case updates with full compliance logging.",
    url: `${baseUrl}/industries/legal`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function LegalPage() {
  return <IndustryDetail industrySlug="legal" />;
}
