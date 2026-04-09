import type { Metadata } from "next";
import { IndustryDetail } from "@/components/public-site/IndustryDetail";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI for Fitness | NodeBase Coach AI",
  description:
    "Automate membership inquiries, class bookings, and renewals for your gym or fitness studio with NodeBase's Coach AI.",
  openGraph: {
    title: "AI for Fitness | NodeBase",
    description:
      "Coach AI handles bookings, membership questions, and renewal reminders automatically.",
    url: `${baseUrl}/industries/fitness`,
    siteName: "NodeBase",
    type: "website",
  },
};

export default function FitnessPage() {
  return <IndustryDetail industrySlug="fitness" />;
}
