import type { Metadata } from "next";
import { HomePage } from "@/components/public-site/HomePage";

export const metadata: Metadata = {
  title: "Nodebase  -  The Enterprise AI Workforce",
  description:
    "Deploy domain-specific AI employees - capable of autonomous voice, vision, and transactional workflows - to scale your operations instantly.",
  openGraph: {
    title: "Nodebase  -  The Enterprise AI Workforce",
    description:
      "Deploy domain-specific AI employees - capable of autonomous voice, vision, and transactional workflows - to scale your operations instantly.",
    url: "/",
    siteName: "Nodebase",
    type: "website",
    images: ["/og/home-1200x630.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nodebase  -  The Enterprise AI Workforce",
    description:
      "Deploy domain-specific AI employees - capable of autonomous voice, vision, and transactional workflows - to scale your operations instantly.",
    images: ["/og/home-1200x630.png"],
  },
  // Basic robots suggestion for indexing (can be extended in robots.txt)
  // This keeps the page indexable by default.
  // Add canonical via layout metadataBase if needed.
};

export const revalidate = 3600; // Revalidate every hour

export default function Page() {
  return <HomePage />;
}
