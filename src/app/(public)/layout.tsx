import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth/session";
import { getAppUrl } from "@/lib/runtime-config";

// Register Twilio adapter here (safer bootstrap place for public layout).
// The registration is conditional and will only run when TELEPHONY_PROVIDER=twilio.
// It is wrapped in a try/catch so a missing config will not crash site rendering.
try {
  // Dynamic import to avoid importing Twilio code unless needed.
  if ((process.env.TELEPHONY_PROVIDER || "").toLowerCase() === "twilio") {
    // Importing at runtime to keep server startup predictable in environments
    // where Twilio credentials are not set or Twilio package is not installed.
    // Note: this requires the Twilio adapter module to exist at the path below.
    // If the adapter throws on missing env vars, catch and log the error.
    // We deliberately avoid throwing here to keep the public site available.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {
      createTwilioAdapter,
    } = require("@/lib/services/telephony/providers/twilio");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {
      registerProviderAdapter,
    } = require("@/lib/services/telephonyService");
    try {
      registerProviderAdapter(createTwilioAdapter());
      // eslint-disable-next-line no-console
      console.info("[Telephony] Twilio adapter registered (public layout)");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        "[Telephony] Twilio adapter registration failed (public layout):",
        err,
      );
    }
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(
    "[Telephony] Adapter bootstrap check failed (public layout):",
    err,
  );
}

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <Header viewer={viewer} />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
