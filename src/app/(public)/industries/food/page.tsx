import type { Metadata } from "next";
import { IndustryDetail } from "@/components/public-site/IndustryDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI for Food & Delivery | NodeBase Chef AI",
  description:
    "Automate orders, delivery tracking, and customer support for your restaurant or cloud kitchen with NodeBase's Chef AI.",
  openGraph: {
    title: "AI for Food & Delivery | NodeBase",
    description:
      "Chef AI handles orders, delivery updates, and customer support across all channels.",
    url: `${baseUrl}/industries/food`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function FoodPage() {
  return <IndustryDetail industrySlug="food" />;
}
