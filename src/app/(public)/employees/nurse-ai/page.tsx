import { AiManagerDetailPage } from "@/components/ai-managers/AiManagerDetailPage";

export default function NurseAiPage() {
  return (
    <AiManagerDetailPage
      slug="nurse-ai"
      title="Nurse AI"
      intro="Nurse AI manages patient conversations, appointment flow, and follow-ups for clinics and diagnostic centers."
      responsibilities={[
        "Inbox management",
        "Follow-ups",
        "Scheduling / calendar",
        "Payments coordination",
        "Context-aware replies",
        "Escalation to staff when needed"
      ]}
      disclaimer="Nurse AI does not provide diagnoses or medical decisions."
    />
  );
}
