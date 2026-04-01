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
    const {
      createTwilioAdapter,
    } = require("@/lib/services/telephony/providers/twilio");
    const {
      registerProviderAdapter,
    } = require("@/lib/services/telephonyService");
    try {
      registerProviderAdapter(createTwilioAdapter());
      console.info("[Telephony] Twilio adapter registered (public layout)");
    } catch (err) {
      console.error(
        "[Telephony] Twilio adapter registration failed (public layout):",
        err,
      );
    }
  }
} catch (err) {
  console.error(
    "[Telephony] Adapter bootstrap check failed (public layout):",
    err,
  );
}

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const appUrl = getAppUrl();
  return {
    openGraph: {
      images: [
        {
          url: `${appUrl}/og/static/home-1200x630.png`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      images: [`${appUrl}/og/static/home-1200x630.png`],
    },
  };
}

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="public-site public-shell flex min-h-screen flex-col">
        <Header />
        <main className="relative z-10 flex-1 pt-[var(--header-height,5rem)]">{children}</main>
        <Footer />
      </div>
    </>
  );
}
