import { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/runtime-config";

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/book/",
        "/bookings/",
        "/chat/",
        "/dashboard/",
        "/guest-id/",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
