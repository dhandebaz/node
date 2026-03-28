import { RenderArticleRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Host AI — Hospitality Operations Agent | Nodebase",
  description:
    "Deploy Host AI to orchestrate omnichannel bookings, manage live guest phone calls via Twilio, and enforce secure KYC verifications.",
};

export default function HostAiPage() {
  return <RenderArticleRoute id="employee-host-ai" />;
}
