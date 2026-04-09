import type { Metadata } from "next";
import { IndustryDetail } from "@/components/public-site/IndustryDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI for Healthcare | NodeBase Nurse AI",
  description:
    "Transform your clinic with NodeBase's Nurse AI. Automated appointment booking, patient intake, prescription OCR, and follow-up management.",
  openGraph: {
    title: "AI for Healthcare | NodeBase",
    description:
      "Nurse AI handles appointment calls, patient intake, and prescription processing automatically.",
    url: `${baseUrl}/industries/healthcare`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function HealthcarePage() {
  return <IndustryDetail industrySlug="healthcare" />;
}
