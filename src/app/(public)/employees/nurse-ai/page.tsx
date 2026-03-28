import { RenderArticleRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nurse AI — Healthcare Operations Agent | Nodebase",
  description:
    "Nurse AI intercepts inbound Twilio calls, accurately resolves patient triage queries, and secures appointments via WhatsApp.",
};

export default function NurseAiPage() {
  return <RenderArticleRoute id="employee-nurse-ai" />;
}
