import type { Metadata } from "next";
import { Outfit, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { getAppUrl } from "@/lib/runtime-config";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

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
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} ${ibmPlexMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <MobileBottomNav />
      </body>
    </html>
  );
}
