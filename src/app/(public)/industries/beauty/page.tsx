import type { Metadata } from "next";
import { IndustryDetail } from "@/components/public-site/IndustryDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI for Beauty & Wellness | NodeBase Style AI",
  description:
    "Automate appointments, product recommendations, and loyalty programs for your salon or spa with NodeBase's Style AI.",
  openGraph: {
    title: "AI for Beauty & Wellness | NodeBase",
    description:
      "Style AI handles bookings, service questions, and loyalty tracking automatically.",
    url: `${baseUrl}/industries/beauty`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function BeautyPage() {
  return <IndustryDetail industrySlug="beauty" />;
}
