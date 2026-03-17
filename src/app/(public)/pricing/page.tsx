import { PricingSurface } from "@/components/public-site/PricingSurface";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Nodebase",
  description:
    "Simple, honest pricing. No hidden fees or commissions on your sales. Pay only for the AI messages you actually use.",
  openGraph: {
    title: "Pricing | Nodebase",
    description:
      "Simple, honest pricing. No hidden fees or commissions — pay only for the AI messages you use. Clear plans for small businesses.",
    url: "/pricing",
    siteName: "Nodebase",
    type: "website",
    images: [
      {
        url: "/og/static/pricing-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Nodebase pricing — simple, transparent plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Nodebase",
    description:
      "Simple, honest pricing. No hidden fees or commissions — pay only for the AI messages you use.",
    images: ["/og/static/pricing-1200x630.png"],
  },
};

export default function PricingPage() {
  return <PricingSurface />;
}
