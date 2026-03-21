"use client";

import { useEffect } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import NotificationProvider from "@/components/providers/NotificationProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then(async (registrations) => {
        const targets = registrations.filter((r) =>
          r.active?.scriptURL.includes("/service-worker.js"),
        );
        if (targets.length === 0) return;

        await Promise.all(targets.map((r) => r.unregister()));

        if (!("caches" in window)) return;
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      })
      .catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
