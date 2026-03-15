import type { Metadata } from "next";
import { Alfa_Slab_One } from "next/font/google";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { getAppUrl } from "@/lib/runtime-config";

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
  title: "nodebase | AI Employees & Digital Infrastructure",
  description:
    "Hire AI Employees. Run Your Business on Autopilot. Powered by Nodebase Core.",
  appleWebApp: {
    title: "nodebase",
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
      </body>
    </html>
  );
}
