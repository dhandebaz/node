import type { Metadata } from "next";
import { IndustryDetail } from "@/components/public-site/IndustryDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI for Social Commerce | NodeBase Thrift AI",
  description:
    "Transform your Instagram selling with NodeBase's Thrift AI. Visual product lookup, DM automation, and Razorpay checkout in WhatsApp.",
  openGraph: {
    title: "AI for Social Commerce | NodeBase",
    description:
      "Thrift AI handles Instagram DMs, visual product lookup, and payment collection automatically.",
    url: `${baseUrl}/industries/social-commerce`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function SocialCommercePage() {
  return <IndustryDetail industrySlug="social-commerce" />;
}
