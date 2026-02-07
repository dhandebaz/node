import { AiManagerDetailPage } from "@/components/ai-managers/AiManagerDetailPage";

export default function HostAiPage() {
  return (
    <AiManagerDetailPage
      slug="host-ai"
      title="Host AI"
      intro="Host AI manages guest conversations, availability, payments, and compliance for short-stay properties."
      responsibilities={[
        "Inbox management",
        "Follow-ups",
        "Scheduling / calendar",
        "Payments coordination",
        "Context-aware replies"
      ]}
    />
  );
}
