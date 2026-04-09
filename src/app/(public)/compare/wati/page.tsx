import type { Metadata } from "next";
import { ComparisonDetail } from "@/components/public-site/ComparisonDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "NodeBase vs Wati: Complete Comparison (2026)",
  description:
    "Detailed comparison of NodeBase vs Wati. See why NodeBase's complete AI workforce platform beats Wati's WhatsApp-only tool with limited AI capabilities.",
  openGraph: {
    title: "NodeBase vs Wati: The Clear Winner",
    description:
      "Wati is just a WhatsApp tool. NodeBase is a complete AI workforce with Voice, Vision, KYC, and multi-channel support for the same price.",
    url: `${baseUrl}/compare/wati`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function WatiCompare() {
  return <ComparisonDetail toolSlug="wati" />;
}
