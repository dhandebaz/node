import { AiManagerDetailPage } from "@/components/ai-managers/AiManagerDetailPage";

export default function GeneralManagerAiPage() {
  return (
    <AiManagerDetailPage
      slug="general-manager-ai"
      title="General Manager AI"
      intro="General Manager AI keeps client operations organized for freelancers and solo service providers."
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
