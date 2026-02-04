"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    products: [
      { name: t("products.kaisa.name"), href: "/products/kaisa" },
      { name: t("products.space.name"), href: "/products/space" },
      { name: t("nav.node"), href: "/node" },
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
    <footer className="bg-black border-t border-white/10 pt-20 pb-10 text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                n
              </div>
              <span className="font-bold text-lg tracking-tight">nodebase</span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-2 pt-2">
              <div className="w-8 h-1 bg-brand-saffron rounded-full"></div>
              <div className="w-8 h-1 bg-white border border-white/10 rounded-full"></div>
              <div className="w-8 h-1 bg-brand-green rounded-full"></div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 text-white">{t("footer.products")}</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-brand-saffron transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 text-white">{t("footer.company")}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-brand-saffron transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 text-white">{t("footer.legal")}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-brand-saffron transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            {t("footer.rights")}
          </p>
          <div className="flex items-center gap-6">
             <span className="text-xs text-white/40 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                {t("footer.system_status")}
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
