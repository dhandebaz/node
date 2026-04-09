import type { Metadata } from "next";
import { IndustryDetail } from "@/components/public-site/IndustryDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI for Real Estate | NodeBase Realtor AI",
  description:
    "Transform your real estate business with NodeBase's Realtor AI. Voice inquiries, property viewings, lead qualification, and follow-ups.",
  openGraph: {
    title: "AI for Real Estate | NodeBase",
    description:
      "Realtor AI handles property calls, site visit scheduling, and lead follow-ups automatically.",
    url: `${baseUrl}/industries/real-estate`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function RealEstatePage() {
  return <IndustryDetail industrySlug="real-estate" />;
}
