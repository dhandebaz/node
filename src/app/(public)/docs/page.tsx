import { RenderDirectoryRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "Documentation | Nodebase",
  description:
    "Learn how to deploy your enterprise AI workforce, connect omnichannel infrastructure, and automate your operations securely.",
  openGraph: {
    title: "Documentation | Nodebase",
    description:
      "Enterprise guides to deploying AI operators, managing compliance bounds, and connecting Nodebase Voice & Eyes.",
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
      "Enterprise guides to deploying AI operators, managing compliance bounds, and connecting Nodebase Voice & Eyes.",
    images: [`${baseUrl}/og/static/docs-1200x630.png`],
  },
};

export default function DocsPage() {
  return <RenderDirectoryRoute id="docs" compact />;
}
