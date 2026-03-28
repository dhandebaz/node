import type { Metadata } from "next";
import { RenderArticleRoute } from "@/components/public-site/ContentRoute";

export const metadata: Metadata = {
  title: "Enterprise Integrations | Nodebase",
  description:
    "Connect omnichannel rails like WhatsApp, Twilio (Voice), Razorpay/Stripe, and Calendar syncs natively into your autonomous AI workforce.",
  openGraph: {
    title: "Enterprise Integrations — Nodebase",
    description:
      "Connect omnichannel rails like WhatsApp, Twilio (Voice), Razorpay/Stripe, and Calendar syncs natively into your autonomous AI workforce.",
  },
};

export default function IntegrationsLanding() {
  // Reuse the canonical integrations article stored in public-content.
  // This keeps the marketing/docs copy single-sourced while exposing
  // a clear public-facing integrations landing page at /integrations.
  return <RenderArticleRoute id="docs-integrations" compact={false} />;
}
