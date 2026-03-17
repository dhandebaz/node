import { RenderDirectoryRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "Documentation | Nodebase",
  description:
    "Learn how to set up your AI assistant, connect your WhatsApp, and automate your customer service in minutes.",
  openGraph: {
    title: "Documentation | Nodebase",
    description:
      "Step-by-step guides to get your AI assistant answering customers, taking bookings, and collecting payments—fast.",
    url: `${baseUrl}/docs`,
    siteName: "Nodebase",
    type: "website",
    images: [
      {
        url: `${baseUrl}/og/static/docs-1200x630.png`,
        width: 1200,
        height: 630,
        alt: "Nodebase documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Documentation | Nodebase",
    description:
      "Step-by-step guides to get your AI assistant answering customers, taking bookings, and collecting payments—fast.",
    images: [`${baseUrl}/og/static/docs-1200x630.png`],
  },
};

export default function DocsPage() {
  return <RenderDirectoryRoute id="docs" compact />;
}
