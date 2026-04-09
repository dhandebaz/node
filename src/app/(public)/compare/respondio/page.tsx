import type { Metadata } from "next";
import { ComparisonDetail } from "@/components/public-site/ComparisonDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "NodeBase vs Respond.io: Complete Comparison (2026)",
  description:
    "Detailed comparison of NodeBase vs Respond.io. See why NodeBase's flat ₹999/mo pricing beats Respond.io's $79-349/mo with hidden fees and AI add-ons.",
  openGraph: {
    title: "NodeBase vs Respond.io: The Clear Winner",
    description:
      "Respond.io costs $79-349/month plus user fees. NodeBase is ₹999/month flat with Voice, Vision, KYC, and unlimited users included.",
    url: `${baseUrl}/compare/respondio`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function RespondioCompare() {
  return <ComparisonDetail toolSlug="respondio" />;
}
