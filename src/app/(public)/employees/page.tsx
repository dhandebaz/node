import { RenderDirectoryRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI Assistants | Nodebase",
  description:
    "Meet the specialized AI assistants built for your business. From homestays to clinics, hire an AI that knows exactly how to handle your customers.",
  openGraph: {
    title: "AI Assistants | Nodebase",
    description:
      "Meet the specialized AI assistants built for your business. From homestays to clinics, hire an AI that knows exactly how to handle your customers.",
    url: `${baseUrl}/employees`,
    siteName: "Nodebase",
    type: "website",
    images: [
      {
        url: `${baseUrl}/og/static/employees-1200x630.png`,
        width: 1200,
        height: 630,
        alt: "Nodebase AI Assistants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Assistants | Nodebase",
    description:
      "Meet the specialized AI assistants built for your business. From homestays to clinics, hire an AI that knows exactly how to handle your customers.",
    images: [`${baseUrl}/og/static/employees-1200x630.png`],
  },
};

export default function EmployeesPage() {
  return <RenderDirectoryRoute id="employees" />;
}
