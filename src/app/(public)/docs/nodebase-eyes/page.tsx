import { RenderArticleRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

/**
 * Public documentation page for Nodebase Eyes.
 * This route re-uses the article content defined in src/lib/public-content.tsx
 * under the key `nodebase-eyes`.
 *
 * Content is single-sourced in the public-content registry and rendered via
 * RenderArticleRoute so marketing/docs copy remains consistent.
 */

export const metadata: Metadata = {
  title: "Nodebase Eyes — Enterprise Vision Intelligence | Nodebase",
  description:
    "Nodebase Eyes securely ingests operational imagery to perform zero-shot OCR, automated KYC, and compliance verification.",
  openGraph: {
    title: "Nodebase Eyes — Enterprise Vision Intelligence",
    description:
      "Secure OCR, ID verification, and visual Q&A designed for enterprise compliance and omnichannel workflows.",
    url: `${baseUrl}/docs/nodebase-eyes`,
  },
  twitter: {
    title: "Nodebase Eyes — Enterprise Vision Intelligence",
    card: "summary_large_image",
  },
};

export default function NodebaseEyesPage() {
  // Render the article content registered at "nodebase-eyes"
  return <RenderArticleRoute id="nodebase-eyes" compact={false} />;
}
