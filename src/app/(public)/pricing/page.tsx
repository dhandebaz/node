import { PricingSurface } from "@/components/public-site/PricingSurface";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Nodebase",
  description:
    "Predictable operational economics. Pay a core licensing fee of ₹999/mo plus highly optimized usage rates for omnichannel AI compute.",
  openGraph: {
    title: "Pricing | Nodebase",
    description:
      "Predictable operational economics. Pay a core licensing fee of ₹999/mo plus highly optimized usage rates for omnichannel AI compute.",
    url: "/pricing",
    siteName: "Nodebase",
    type: "website",
    images: [
      {
        url: "/og/static/pricing-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Nodebase pricing  -  enterprise scale economics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Nodebase",
    description:
      "Predictable operational economics. Pay a core licensing fee of ₹999/mo plus highly optimized usage rates for omnichannel AI compute.",
    images: ["/og/static/pricing-1200x630.png"],
  },
};

export default function PricingPage() {
  return <PricingSurface />;
}
