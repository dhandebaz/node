import type { Metadata } from "next";
import { ComparisonDetail } from "@/components/public-site/ComparisonDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "NodeBase vs Interakt: Complete Comparison (2026)",
  description:
    "Detailed comparison of NodeBase vs Interakt. See why NodeBase's complete AI platform with Voice, Vision, and KYC beats Interakt's WhatsApp-focused marketing tool.",
  openGraph: {
    title: "NodeBase vs Interakt: The Clear Winner",
    description:
      "Interakt is just WhatsApp marketing. NodeBase is a complete AI workforce for hospitality, healthcare, retail and more.",
    url: `${baseUrl}/compare/interakt`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function InteraktCompare() {
  return <ComparisonDetail toolSlug="interakt" />;
}
