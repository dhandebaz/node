import { RenderArticleRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "Trust Center | Nodebase",
  description:
    "Your data is secure, and you are always in complete control. Learn how we protect your business and your customers.",
  openGraph: {
    title: "Trust Center | Nodebase",
    description:
      "Your data is secure, and you are always in complete control. Learn how we protect your business and your customers.",
    url: `${baseUrl}/trust`,
    siteName: "Nodebase",
    type: "website",
    images: [
      {
        url: `${baseUrl}/og/static/trust-1200x630.png`,
        width: 1200,
        height: 630,
        alt: "Nodebase Trust Center",
      },
      {
        url: `${baseUrl}/og/static/employees-1200x630.png`,
        width: 1200,
        height: 630,
        alt: "Nodebase AI Assistants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trust Center | Nodebase",
    description:
      "Your data is secure, and you are always in complete control. Learn how we protect your business and your customers.",
    images: [`${baseUrl}/og/static/trust-1200x630.png`],
  },
};

export default function TrustPage() {
  return <RenderArticleRoute id="trust" />;
}
