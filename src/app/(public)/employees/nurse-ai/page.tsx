import { RenderArticleRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nurse AI | Nodebase",
  description:
    "Nurse AI manages your clinic's appointments so you can focus on patients. Built for clinics and diagnostic centers.",
};

export default function NurseAiPage() {
  return <RenderArticleRoute id="employee-nurse-ai" />;
}
