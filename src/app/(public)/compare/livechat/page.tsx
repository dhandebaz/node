import type { Metadata } from "next";
import { ComparisonDetail } from "@/components/public-site/ComparisonDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "NodeBase vs LiveChat: Live Chat Platform Comparison (2026)",
  description:
    "Compare NodeBase vs LiveChat. See how NodeBase's omnichannel AI platform beats LiveChat's website-only chat solution.",
  openGraph: {
    title: "NodeBase vs LiveChat: Beyond Website Chat",
    description:
      "LiveChat charges $20-59 per agent. NodeBase is ₹999/month flat with unlimited users, WhatsApp, Instagram, Voice, Vision, and KYC included.",
    url: `${baseUrl}/compare/livechat`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function LivechatCompare() {
  return <ComparisonDetail toolSlug="livechat" />;
}
