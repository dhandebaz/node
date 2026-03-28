import { RenderArticleRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thrift AI — Social Commerce Operations Agent | Nodebase",
  description:
    "Deploy Thrift AI to process inbound images via Nodebase Eyes to identify precise SKU requests and execute secure Razorpay checkouts.",
};

export default function ThriftAiPage() {
  return <RenderArticleRoute id="employee-thrift-ai" />;
}
