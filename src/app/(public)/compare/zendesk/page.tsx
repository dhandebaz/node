import type { Metadata } from "next";
import { ComparisonDetail } from "@/components/public-site/ComparisonDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "NodeBase vs Zendesk: Customer Service Comparison (2026)",
  description:
    "Compare NodeBase vs Zendesk. See how NodeBase's AI-powered platform beats Zendesk's enterprise pricing with simple ₹999/mo flat rate.",
  openGraph: {
    title: "NodeBase vs Zendesk: Better AI, Better Price",
    description:
      "Zendesk charges $55-155 per agent. NodeBase is ₹999/month flat with unlimited agents, Voice, Vision, and KYC included.",
    url: `${baseUrl}/compare/zendesk`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function ZendeskCompare() {
  return <ComparisonDetail toolSlug="zendesk" />;
}
