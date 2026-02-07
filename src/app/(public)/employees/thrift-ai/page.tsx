import { AiManagerDetailPage } from "@/components/ai-managers/AiManagerDetailPage";

export default function ThriftAiPage() {
  return (
    <AiManagerDetailPage
      slug="thrift-ai"
      title="Thrift AI"
      intro="Thrift AI manages buyer conversations, listing updates, and follow-ups for resale businesses."
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
