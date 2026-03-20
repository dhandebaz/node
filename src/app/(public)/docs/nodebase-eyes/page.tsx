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
  title: "Nodebase Eyes — CCTV & Vision Intelligence (coming soon) | Nodebase",
  description:
    "Nodebase Eyes is a secure CCTV and vision intelligence integration to surface events, alerts, and context for AI operations. Join the waitlist for pilot access.",
  openGraph: {
    title: "Nodebase Eyes — CCTV & Vision Intelligence (coming soon)",
    description:
      "Securely ingest camera streams, run vision detections, and deliver contextual alerts into your omnichannel workflow.",
    url: `${baseUrl}/docs/nodebase-eyes`,
  },
  twitter: {
    title: "Nodebase Eyes — CCTV & Vision Intelligence (coming soon)",
    card: "summary_large_image",
  },
};

export default function NodebaseEyesPage() {
  // Render the article content registered at "nodebase-eyes"
  return <RenderArticleRoute id="nodebase-eyes" compact={false} />;
}
