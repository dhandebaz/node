import type { Metadata } from "next";
import { IndustryDetail } from "@/components/public-site/IndustryDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI for Education | NodeBase Tutor AI",
  description:
    "Transform your coaching center or online course with NodeBase's Tutor AI. Automated inquiries, enrollment, and student communications.",
  openGraph: {
    title: "AI for Education | NodeBase",
    description:
      "Tutor AI handles admissions, demo bookings, and student follow-ups automatically.",
    url: `${baseUrl}/industries/education`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function EducationPage() {
  return <IndustryDetail industrySlug="education" />;
}
