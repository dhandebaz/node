import { RenderArticleRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

/**
 * Public documentation page for Nodebase Voice.
 * This route re-uses the article content defined in src/lib/public-content.tsx
 * under the key `nodebase-voice`.
 *
 * The page is intentionally simple and single-sourced: content is authored in
 * the shared public-content registry and rendered via RenderArticleRoute.
 */

export const metadata: Metadata = {
  title: "Nodebase Voice — AI Phone Agent (coming soon) | Nodebase",
  description:
    "Nodebase Voice is an AI-powered phone agent that can answer calls, take bookings, and perform payment-supported flows by voice. Join the waitlist for early access.",
  openGraph: {
    title: "Nodebase Voice — AI Phone Agent (coming soon)",
    description:
      "An AI phone agent that integrates with your omnichannel inbox: STT, TTS, call handling, and operator handoff.",
    url: `${baseUrl}/docs/nodebase-voice`,
  },
  twitter: {
    title: "Nodebase Voice — AI Phone Agent (coming soon)",
    card: "summary_large_image",
  },
};

export default function NodebaseVoicePage() {
  // Reuse the canonical docs article from the public-content map.
  return <RenderArticleRoute id="nodebase-voice" compact={false} />;
}
