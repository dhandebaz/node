import { RenderArticleRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dukan AI | Nodebase",
  description:
    "Dukan AI handles questions and takes orders on WhatsApp automatically. Perfect for local stores.",
};

export default function DukanAiPage() {
  return <RenderArticleRoute id="employee-dukan-ai" />;
}
