import type { Metadata } from "next";
import { ComparisonDetail } from "@/components/public-site/ComparisonDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "NodeBase vs Drift: Conversational Marketing Comparison (2026)",
  description:
    "Compare NodeBase vs Drift. See how NodeBase's affordable AI platform beats Drift's $2000+/month B2B chatbot solution.",
  openGraph: {
    title: "NodeBase vs Drift: Affordable AI for All Businesses",
    description:
      "Drift charges $2000+/month. NodeBase is ₹999/month flat with unlimited users, Voice, Vision, and KYC included.",
    url: `${baseUrl}/compare/drift`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function DriftCompare() {
  return <ComparisonDetail toolSlug="drift" />;
}
