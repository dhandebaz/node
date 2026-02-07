import { AiManagerDetailPage } from "@/components/ai-managers/AiManagerDetailPage";

export default function DukanAiPage() {
  return (
    <AiManagerDetailPage
      slug="dukan-ai"
      title="Dukan AI"
      intro="Dukan AI manages customer conversations, order updates, and follow-ups for local retail stores."
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
