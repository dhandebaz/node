import type { Metadata } from "next";
import { IndustryDetail } from "@/components/public-site/IndustryDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI for Automotive | NodeBase Mechanic AI",
  description:
    "Automate test drive bookings, service scheduling, and customer updates for your car dealership or service center.",
  openGraph: {
    title: "AI for Automotive | NodeBase",
    description:
      "Mechanic AI handles vehicle inquiries, test drives, and service updates automatically.",
    url: `${baseUrl}/industries/automotive`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function AutomotivePage() {
  return <IndustryDetail industrySlug="automotive" />;
}
