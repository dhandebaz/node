import type { Metadata } from "next";
import { IndustryDetail } from "@/components/public-site/IndustryDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI for Retail | NodeBase Dukan AI",
  description:
    "Transform your retail store with NodeBase's Dukan AI. WhatsApp ordering, inventory queries, payment links, and delivery coordination.",
  openGraph: {
    title: "AI for Retail | NodeBase",
    description:
      "Dukan AI handles WhatsApp orders, inventory checks, and delivery coordination automatically.",
    url: `${baseUrl}/industries/retail`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function RetailPage() {
  return <IndustryDetail industrySlug="retail" />;
}
