import { RenderArticleRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Omni AI  -  Autonomous Operations Agent | Nodebase",
  description:
    "Deploy Omni AI to orchestrate omnichannel workflows, manage live client phone calls via Twilio, and enforce secure KYC verifications.",
};

export default function OmniAiPage() {
  return <RenderArticleRoute id="employee-omni-ai" />;
}
