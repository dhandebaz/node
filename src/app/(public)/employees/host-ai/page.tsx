import { RenderArticleRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Host AI | Nodebase",
  description:
    "Host AI answers your guests instantly so you can get back your time. Designed for homestays and vacation rentals.",
};

export default function HostAiPage() {
  return <RenderArticleRoute id="employee-host-ai" />;
}
