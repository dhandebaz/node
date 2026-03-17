import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth/session";
import { getAppUrl } from "@/lib/runtime-config";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const viewer = session?.userId
    ? {
        authenticated: true,
        email: session.email ?? null,
        dashboardHref:
          session.role === "superadmin" ? "/admin" : "/dashboard/ai",
      }
    : null;

  const appUrl = getAppUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Nodebase",
        url: appUrl,
        logo: `${appUrl}/images/azadnode.png`,
      },
      {
        "@type": "WebSite",
        url: appUrl,
        name: "Nodebase",
        publisher: {
          "@type": "Organization",
          name: "Nodebase",
          logo: {
            "@type": "ImageObject",
            url: `${appUrl}/images/azadnode.png`,
          },
        },
      },
    ],
  };

  return (
    <div className="public-site public-shell flex min-h-screen flex-col">
      <head>
        {/* Fallback Open Graph / Twitter images for social previews */}
        <meta
          property="og:image"
          content={`${appUrl}/og/static/home-1200x630.png`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          name="twitter:image"
          content={`${appUrl}/og/static/home-1200x630.png`}
        />
        {/* Site-level JSON-LD structured data (Organization + WebSite). */}
        <script
          key="site-json-ld"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <Header viewer={viewer} />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
