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
  title: "Nodebase Voice  -  Conversational Telephony | Nodebase",
  description:
    "Nodebase Voice is an enterprise telephony agent that handles live inbound calls, reservations, and compliance-first IVR flows via WebRTC and Twilio.",
  openGraph: {
    title: "Nodebase Voice  -  Conversational Telephony",
    description:
      "Enterprise telephony agent integrating directly into your omnichannel inbox: WebRTC, TTS, and native escalation.",
    url: `${baseUrl}/docs/nodebase-voice`,
  },
  twitter: {
    title: "Nodebase Voice  -  Conversational Telephony",
    card: "summary_large_image",
  },
};

export default function NodebaseVoicePage() {
  // Reuse the canonical docs article from the public-content map.
  return <RenderArticleRoute id="nodebase-voice" compact={false} />;
}
