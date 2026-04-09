import type { Metadata } from "next";
import { ComparisonDetail } from "@/components/public-site/ComparisonDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "NodeBase vs Kommo: Complete Comparison (2026)",
  description:
    "Detailed comparison of NodeBase vs Kommo. See why NodeBase's domain-specific AI, Voice + Vision, and flat ₹999/mo pricing beats Kommo's $15-45/user model.",
  openGraph: {
    title: "NodeBase vs Kommo: The Clear Winner",
    description:
      "Kommo charges $15-45 per user. NodeBase is ₹999/month flat with unlimited users, Voice, Vision, and KYC included.",
    url: `${baseUrl}/compare/kommo`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function KommoCompare() {
  return <ComparisonDetail toolSlug="kommo" />;
}
