import type { Metadata } from "next";
import { HomePage } from "@/components/public-site/HomePage";

export const metadata: Metadata = {
  title: "Nodebase — AI assistants for local businesses",
  description:
    "Get a professional, mobile-friendly assistant that answers customers, schedules bookings, and collects payments — ready in 5 minutes.",
  openGraph: {
    title: "Nodebase — AI assistants for local businesses",
    description:
      "Get a professional, mobile-friendly assistant that answers customers, schedules bookings, and collects payments — ready in 5 minutes.",
    url: "/",
    siteName: "Nodebase",
    type: "website",
    images: ["/og/home-1200x630.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nodebase — AI assistants for local businesses",
    description:
      "Get a professional, mobile-friendly assistant that answers customers, schedules bookings, and collects payments — ready in 5 minutes.",
    images: ["/og/home-1200x630.png"],
  },
  // Basic robots suggestion for indexing (can be extended in robots.txt)
  // This keeps the page indexable by default.
  // Add canonical via layout metadataBase if needed.
};

export default function Page() {
  return <HomePage />;
}
