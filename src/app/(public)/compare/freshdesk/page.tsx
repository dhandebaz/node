import type { Metadata } from "next";
import { ComparisonDetail } from "@/components/public-site/ComparisonDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "NodeBase vs Freshdesk: Support Platform Comparison (2026)",
  description:
    "Compare NodeBase vs Freshdesk. See how NodeBase's domain-specific AI beats Freshdesk's basic features at a fraction of the cost.",
  openGraph: {
    title: "NodeBase vs Freshdesk: SMB Support Comparison",
    description:
      "Freshdesk charges $15-79 per agent. NodeBase is ₹999/month flat with unlimited users, Voice, Vision, and KYC included.",
    url: `${baseUrl}/compare/freshdesk`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function FreshdeskCompare() {
  return <ComparisonDetail toolSlug="freshdesk" />;
}
