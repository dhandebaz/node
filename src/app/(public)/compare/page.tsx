import type { Metadata } from "next";
import { CompareIndex } from "@/components/public-site/CompareIndex";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "Compare NodeBase vs Competitors | The Complete Analysis",
  description:
    "See how NodeBase compares to Kommo, Respond.io, Wati, and other messaging platforms. Domain-specific AI, Voice + Vision, KYC - all included at ₹999/mo.",
  openGraph: {
    title: "NodeBase vs Competitors | Complete Comparison Guide",
    description:
      "The most comprehensive comparison of NodeBase against Kommo, Respond.io, Wati, and more. See why NodeBase wins.",
    url: `${baseUrl}/compare`,
    siteName: "NodeBase",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NodeBase vs Competitors | Complete Comparison",
    description:
      "Domain-specific AI vs generic bots. See why businesses switch to NodeBase.",
  },
};

export default function Compare() {
  return <CompareIndex />;
}
