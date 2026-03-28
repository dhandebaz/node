import type { Metadata } from "next";
import { Outfit, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { getAppUrl } from "@/lib/runtime-config";
export const dynamic = "force-dynamic";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: "Nodebase | The AI Assistant for Local Businesses",
  description:
    "Nodebase connects to your WhatsApp and website to instantly answer customer questions, schedule bookings, and collect payments automatically—24/7.",
  appleWebApp: {
    title: "Nodebase",
  },
  openGraph: {
    title: "Nodebase | The AI Assistant for Local Businesses",
    description:
      "Nodebase connects to your WhatsApp and website to instantly answer customer questions, schedule bookings, and collect payments automatically—24/7.",
    url: getAppUrl(),
    siteName: "Nodebase",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nodebase | The AI Assistant for Local Businesses",
    description:
      "Nodebase connects to your WhatsApp and website to instantly answer customer questions, schedule bookings, and collect payments automatically—24/7.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} ${ibmPlexMono.variable} min-h-screen bg-background text-foreground font-sans antialiased`}
      >
        <div className="fixed inset-0 z-[-1] bg-grid-white" />
        <div className="fixed top-[-20%] left-[-10%] z-[-1] h-[70vh] w-[70vw] rounded-full mesh-bg-orb-1 blur-[100px]" />
        <div className="fixed bottom-[-20%] right-[-10%] z-[-1] h-[70vh] w-[70vw] rounded-full mesh-bg-orb-2 blur-[100px]" />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
