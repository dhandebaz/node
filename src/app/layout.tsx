import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { getAppUrl } from "@/lib/runtime-config";
// export const dynamic = "force-dynamic";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: "Nodebase | The AI Assistant for Local Businesses",
  description:
    "Nodebase connects to your WhatsApp and website to instantly answer customer questions, schedule bookings, and collect payments automatically - 24/7.",
  appleWebApp: {
    title: "Nodebase",
  },
  openGraph: {
    title: "Nodebase | The AI Assistant for Local Businesses",
    description:
      "Nodebase connects to your WhatsApp and website to instantly answer customer questions, schedule bookings, and collect payments automatically - 24/7.",
    url: getAppUrl(),
    siteName: "Nodebase",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nodebase — The AI Assistant for Local Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nodebase | The AI Assistant for Local Businesses",
    description:
      "Nodebase connects to your WhatsApp and website to instantly answer customer questions, schedule bookings, and collect payments automatically - 24/7.",
    images: ["/og-image.png"],
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
        className={`${montserrat.variable} min-h-screen bg-white text-foreground font-sans antialiased selection:bg-blue-500/10 selection:text-blue-900`}
      >
        {/* Immersive Background Engine - Light Optimized */}
        <div className="noise-overlay" />
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          {/* Main Orbs - Very subtle for light mode, simplified for mobile */}
          <div className="absolute top-[-20%] left-[-10%] h-[100vh] w-[100vw] rounded-full mesh-bg-orb-1 blur-[120px] opacity-40 animate-pulse-slow md:opacity-40 opacity-20" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[100vh] w-[100vw] rounded-full mesh-bg-orb-2 blur-[120px] opacity-30 animate-pulse-slow hidden md:block" style={{ animationDelay: '2s' }} />
          
          {/* Subtle accent orbs - Desktop Only */}
          <div className="absolute top-[40%] right-[10%] h-[40vh] w-[40vw] rounded-full bg-blue-400/5 blur-[100px] hidden lg:block" />
          <div className="absolute bottom-[20%] left-[20%] h-[30vh] w-[30vh] rounded-full bg-purple-400/5 blur-[80px] hidden lg:block" />
          
          {/* Grid structure - dark on light */}
          <div className="absolute inset-0 bg-grid-white opacity-[0.5] md:opacity-[1]" />
        </div>

        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
