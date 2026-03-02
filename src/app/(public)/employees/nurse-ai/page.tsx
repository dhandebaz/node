import { AiManagerDetailPage } from "@/components/ai-managers/AiManagerDetailPage";

export default function NurseAiPage() {
  return (
    <AiManagerDetailPage
      slug="nurse-ai"
      title="Nurse AI"
      intro="Nurse AI manages patient appointments, clinic FAQs, and automated follow-ups so your doctors can focus on care."
      responsibilities={[
        "Patient appointment scheduling",
        "Automated WhatsApp reminders",
        "Basic clinic FAQ answering",
        "Post-visit follow-ups",
        "Seamless calendar management"
      ]}
    />
  );
}
