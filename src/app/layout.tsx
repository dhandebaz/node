import type { Metadata } from "next";
import { Alfa_Slab_One } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getAppSettingsAction } from "@/app/actions/settings";
import { FirebaseAnalytics } from "@/components/analytics/FirebaseAnalytics";

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
  const settings = await getAppSettingsAction();
  
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${alfaSlabOne.variable} font-sans antialiased min-h-screen flex flex-col`}
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
