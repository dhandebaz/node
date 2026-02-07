"use client";

import Image from "next/image";

export const DEFAULT_INTEGRATION_LOGOS = [
  { name: "WhatsApp", src: "/images/integrations/whatsapp.png" },
  { name: "Instagram", src: "/images/integrations/instagram.png" },
  { name: "Facebook Messenger", src: "/images/integrations/facebook.png" },
  { name: "Google (Email + Calendar)", src: "/images/integrations/google.png" },
  { name: "Web forms", src: "/images/integrations/web-forms.svg" },
  { name: "iCal calendars", src: "/images/integrations/ical.svg" }
];

export function IntegrationLogoRow() {
  return (
    <div className="flex flex-wrap gap-6 items-center">
      {DEFAULT_INTEGRATION_LOGOS.map((logo) => (
        <div key={logo.name} className="flex items-center gap-3 text-sm text-brand-bone/70">
          <div className="relative w-10 h-10">
            <Image src={logo.src} alt={logo.name} fill className="object-contain" />
          </div>
          <span>{logo.name}</span>
        </div>
      ))}
    </div>
  );
}
