import type { Metadata } from "next";
import { IndustryDetail } from "@/components/public-site/IndustryDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI for Hospitality | NodeBase Host AI",
  description:
    "Transform your Airbnb or hotel with NodeBase's Host AI. Automated guest communication, booking management, KYC verification, and payment collection.",
  openGraph: {
    title: "AI for Hospitality | NodeBase",
    description:
      "Host AI handles guest messages, booking inquiries, check-ins, and payments automatically.",
    url: `${baseUrl}/industries/hospitality`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function HospitalityPage() {
  return <IndustryDetail industrySlug="hospitality" />;
}
