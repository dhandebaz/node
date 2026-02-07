"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/ui/Logo";
import { COMPANY_CONFIG } from "@/lib/config/company";

export function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    products: [
      { name: "AI Manager", href: "/products/manager" },
      { name: "AI Co-Founder", href: "/products/co-founder" },
      { name: "Nodebase Space", href: "/space" },
      { name: "Nodebase Node", href: "/node" },
    ],
    company: [
      { name: t("footer.about"), href: "/company" },
      { name: t("footer.contact"), href: "/company/contact" },
      { name: t("footer.careers"), href: "/company/careers" },
      { name: t("footer.partners"), href: "/company/partners" },
      { name: t("footer.docs"), href: "/docs" },
    ],
    legal: [
      { name: t("footer.privacy"), href: "/legal/privacy" },
      { name: t("footer.terms"), href: "/legal/terms" },
      { name: t("footer.risk"), href: "/node/risk" },
      { name: t("footer.refund"), href: "/legal/refund" },
      { name: t("footer.cookies"), href: "/legal/cookies" },
      { name: t("footer.aup"), href: "/legal/aup" },
      { name: t("footer.sla"), href: "/legal/sla" },
    ],
  };

  return (
    <footer className="bg-[var(--color-brand-red)] border-t border-white/20 pt-24 pb-12 text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
          <div className="space-y-6">
            <Link href="/" className="block">
              <Logo className="w-16 h-16" />
            </Link>
            <div className="space-y-4">
              <p className="text-sm font-medium opacity-60 max-w-xs uppercase tracking-wide">
                The intelligence infrastructure company.
              </p>
              <address className="not-italic text-xs opacity-50 uppercase tracking-widest flex flex-col gap-1">
                <span>{COMPANY_CONFIG.headquarters.address}</span>
              </address>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest opacity-40 mb-6">Products</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link, index) => (
                <li key={`${link.name}-${index}`}>
                  <Link href={link.href} className="text-sm font-bold uppercase tracking-wider hover:underline decoration-1 underline-offset-4">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest opacity-40 mb-6">{t("footer.company")}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={`${link.name}-${index}`}>
                  <Link href={link.href} className="text-sm font-bold uppercase tracking-wider hover:underline decoration-1 underline-offset-4">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest opacity-40 mb-6">{t("footer.legal")}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={`${link.name}-${index}`}>
                  <Link href={link.href} className="text-sm font-bold uppercase tracking-wider hover:underline decoration-1 underline-offset-4">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold uppercase tracking-widest opacity-40">
            {t("footer.rights")}
          </p>
          <div className="flex items-center gap-6">
             <span className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                System Normal
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
