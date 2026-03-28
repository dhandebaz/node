import { RenderArticleRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dukan AI — Omnichannel Retail Agent | Nodebase",
  description:
    "Deploy Dukan AI to orchestrate retail volume across Voice and Text grids, intelligently managing inventory and checkouts.",
};

export default function DukanAiPage() {
  return <RenderArticleRoute id="employee-dukan-ai" />;
}
