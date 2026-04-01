import type { Metadata } from "next";
import { FeaturesPage } from "@/components/public-site/FeaturesPage";

export const metadata: Metadata = {
  title: "Features - Nodebase | AI Workforce Platform",
  description:
    "Explore Nodebase features: unified inbox, AI voice & vision, automated KYC, payment processing, and domain-specific AI employees for your business.",
  openGraph: {
    title: "Features - Nodebase | AI Workforce Platform",
    description:
      "Explore Nodebase features: unified inbox, AI voice & vision, automated KYC, payment processing, and domain-specific AI employees for your business.",
    url: "/features",
    siteName: "Nodebase",
    type: "website",
  },
};

export const revalidate = 3600;

export default function Page() {
  return <FeaturesPage />;
}
