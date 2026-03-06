"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/ui/Logo";
import { COMPANY_CONFIG } from "@/lib/config/company";

export function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    employees: [
      { name: "Host AI", href: "/employees/host-ai" },
      { name: "Dukan AI", href: "/employees/dukan-ai" },
      { name: "Nurse AI", href: "/employees/nurse-ai" },
      { name: "Thrift AI", href: "/employees/thrift-ai" },
    ],
    company: [
      { name: "Contact Us", href: "/company/contact" },
    ],
    legal: [
      { name: "Terms of Service", href: "/legal/terms" },
      { name: "Privacy Policy", href: "/legal/privacy" },
      { name: "Refund Policy", href: "/legal/refund" },
    ],
  };

  return (
    <footer className="bg-brand-red border-t border-white/20 pt-24 pb-12 text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
          <div className="space-y-6">
            <Link href="/" className="block">
              <Logo className="w-16 h-16" />
            </Link>
            <div className="space-y-4">
              <p className="text-sm font-medium opacity-60 max-w-xs uppercase tracking-wide">
                The intelligent workforce for Indian businesses.
              </p>
              <address className="not-italic text-xs opacity-50 uppercase tracking-widest flex flex-col gap-1">
                <span>{COMPANY_CONFIG.headquarters.address}</span>
              </address>
            </div>
          </div>

          <nav aria-label="Footer Navigation" className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest opacity-40 mb-6">AI Employees</h3>
              <ul className="space-y-3">
                {footerLinks.employees.map((link, index) => (
                  <li key={`${link.name}-${index}`}>
                    <Link href={link.href} className="text-sm font-bold uppercase tracking-wider hover:underline decoration-1 underline-offset-4">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest opacity-40 mb-6">Company</h3>
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
              <h3 className="font-bold text-xs uppercase tracking-widest opacity-40 mb-6">Legal</h3>
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
          </nav>
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
