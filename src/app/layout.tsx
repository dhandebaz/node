import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getAppSettingsAction } from "@/app/actions/settings";
import { FirebaseAnalytics } from "@/components/analytics/FirebaseAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nodebase | India's AI & Digital Infrastructure",
  description: "Institutional digital infrastructure for the next generation of AI and technology. Kaisa AI, Nodebase Space, and dedicated nodes.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getAppSettingsAction();
  
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <FirebaseAnalytics 
            configString={settings.analytics?.firebaseConfig || ""} 
            enabled={settings.analytics?.enabled || false} 
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
