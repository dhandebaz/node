import type { Metadata } from "next";
import { ComparisonDetail } from "@/components/public-site/ComparisonDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "NodeBase vs HubSpot: CRM Comparison (2026)",
  description:
    "Compare NodeBase vs HubSpot. See how NodeBase's AI-first approach beats HubSpot's marketing-focused CRM with simple ₹999/mo pricing.",
  openGraph: {
    title: "NodeBase vs HubSpot: AI-First vs Marketing-First",
    description:
      "HubSpot charges $50-5000/month with per-user fees. NodeBase is ₹999/month flat with unlimited users, Voice, Vision, and KYC included.",
    url: `${baseUrl}/compare/hubspot`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function HubspotCompare() {
  return <ComparisonDetail toolSlug="hubspot" />;
}
