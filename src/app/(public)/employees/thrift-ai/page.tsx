import { AiManagerDetailPage } from "@/components/ai-managers/AiManagerDetailPage";

export default function ThriftAiPage() {
  return (
    <AiManagerDetailPage
      slug="thrift-ai"
      title="Thrift AI"
      intro="Thrift AI handles your Instagram DMs, closes sales, and manages shipping updates for your online thrift store."
      responsibilities={[
        "Instagram DM management",
        "Price drops and negotiation",
        "Size and condition FAQ",
        "Payment collection",
        "Shipping tracking updates"
      ]}
    />
  );
}
