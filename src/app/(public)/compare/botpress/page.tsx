import type { Metadata } from "next";
import { ComparisonDetail } from "@/components/public-site/ComparisonDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "NodeBase vs Botpress: Chatbot Platform Comparison (2026)",
  description:
    "Compare NodeBase vs Botpress. See how NodeBase's ready-to-use AI agents beat Botpress's DIY approach with no coding required.",
  openGraph: {
    title: "NodeBase vs Botpress: Ready-to-Use vs Build-Your-Own",
    description:
      "Botpress requires technical setup. NodeBase is ₹999/month flat with domain-specific AI that works out of the box.",
    url: `${baseUrl}/compare/botpress`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function BotpressCompare() {
  return <ComparisonDetail toolSlug="botpress" />;
}
