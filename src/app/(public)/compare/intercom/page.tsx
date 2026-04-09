import type { Metadata } from "next";
import { ComparisonDetail } from "@/components/public-site/ComparisonDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "NodeBase vs Intercom: Customer Messaging Comparison (2026)",
  description:
    "Compare NodeBase vs Intercom. See how NodeBase's domain-specific AI and flat ₹999/mo pricing beats Intercom's $74-137/user model.",
  openGraph: {
    title: "NodeBase vs Intercom: The Modern Alternative",
    description:
      "Intercom charges $74-137 per user. NodeBase is ₹999/month flat with unlimited users, Voice, Vision, and KYC included.",
    url: `${baseUrl}/compare/intercom`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function IntercomCompare() {
  return <ComparisonDetail toolSlug="intercom" />;
}
