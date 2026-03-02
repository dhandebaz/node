import { AiManagerDetailPage } from "@/components/ai-managers/AiManagerDetailPage";

export default function DukanAiPage() {
  return (
    <AiManagerDetailPage
      slug="dukan-ai"
      title="Dukan AI"
      intro="Dukan AI manages customer conversations, order updates, and follow-ups for local retail stores."
      responsibilities={[
        "WhatsApp order taking",
        "Inventory and price inquiries",
        "UPI payment link generation",
        "Delivery status updates",
        "Multilingual local customer support"
      ]}
    />
  );
}
