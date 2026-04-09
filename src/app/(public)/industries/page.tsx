import type { Metadata } from "next";
import { IndustriesIndex } from "@/components/public-site/IndustriesIndex";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI Solutions by Industry | Hospitality, Healthcare, Retail & More",
  description:
    "NodeBase offers domain-specific AI employees for every industry. Host AI for hospitality, Nurse AI for healthcare, Dukan AI for retail, and more.",
  openGraph: {
    title: "AI Solutions by Industry | NodeBase",
    description:
      "Domain-specific AI employees for hospitality, healthcare, retail, social commerce, and real estate.",
    url: `${baseUrl}/industries`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function Industries() {
  return <IndustriesIndex />;
}
