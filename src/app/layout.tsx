import type { Metadata } from "next";
import { Alfa_Slab_One } from "next/font/google";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { getAppUrl } from "@/lib/runtime-config";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export const dynamic = "force-dynamic";

const alfaSlabOne = Alfa_Slab_One({
  variable: "--font-alfa-slab-one",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
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
        className={`${alfaSlabOne.className} ${alfaSlabOne.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased min-h-screen flex flex-col`}
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
