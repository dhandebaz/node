import { RenderDirectoryRoute } from "@/components/public-site/ContentRoute";
import { Metadata } from "next";
import { getAppUrl } from "@/lib/runtime-config";

const baseUrl = getAppUrl();

/**
 * Page metadata for SEO and social previews.
 * - Keeps the headline benefit-focused for business owners.
 * - Adds Open Graph and Twitter card images (place images under node/public/og/static/).
 */
export const metadata: Metadata = {
  title: "Company | Nodebase",
  description:
    "We help small businesses automate customer conversations, bookings, and payments  -  built for real owners, not engineers.",
  openGraph: {
    title: "Company | Nodebase",
    description:
      "We help small businesses automate customer conversations, bookings, and payments  -  built for real owners, not engineers.",
    url: `${baseUrl}/company`,
    siteName: "Nodebase",
    type: "website",
    images: [
      {
        url: `${baseUrl}/og/static/company-1200x630.png`,
        width: 1200,
        height: 630,
        alt: "Nodebase  -  AI assistants for local businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Company | Nodebase",
    description:
      "We help small businesses automate customer conversations, bookings, and payments  -  built for real owners, not engineers.",
    images: [`${baseUrl}/og/static/company-1200x630.png`],
  },
};

export default function CompanyPage() {
  return <RenderDirectoryRoute id="company" />;
}
