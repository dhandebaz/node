import type { Metadata } from "next";
import { Alfa_Slab_One } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

export const dynamic = "force-dynamic";

const alfaSlabOne = Alfa_Slab_One({
  variable: "--font-alfa-slab-one",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "nodebase | AI Employees & Digital Infrastructure",
  description: "Hire AI Employees. Run Your Business on Autopilot. Powered by Nodebase Core.",
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
        className={`${alfaSlabOne.className} ${alfaSlabOne.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
