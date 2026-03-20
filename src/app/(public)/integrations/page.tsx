import type { Metadata } from "next";
import { RenderArticleRoute } from "@/components/public-site/ContentRoute";

export const metadata: Metadata = {
  title: "Integrations | Nodebase",
  description:
    "Connect messaging, payments, calendars, and more — integrations are designed for operational reliability and auditability.",
  openGraph: {
    title: "Integrations — Nodebase",
    description:
      "Learn how Nodebase connects to WhatsApp, Instagram, Google Calendar, payment rails, and other operational systems.",
  },
};

export default function IntegrationsLanding() {
  // Reuse the canonical integrations article stored in public-content.
  // This keeps the marketing/docs copy single-sourced while exposing
  // a clear public-facing integrations landing page at /integrations.
  return <RenderArticleRoute id="docs-integrations" compact={false} />;
}
