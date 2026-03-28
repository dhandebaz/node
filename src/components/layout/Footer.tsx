import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { COMPANY_CONFIG } from "@/lib/config/company";
import { footerLinkGroups } from "@/lib/public-content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 pb-8 pt-4 sm:pb-10">
      <div className="public-container">
        <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem]">
          <div className="relative z-10 space-y-10">
            {/* Top section: brand + contact */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <Logo className="text-white" />
                  <p className="max-w-xl text-sm text-zinc-400">
                    AI employees for businesses that run on messages,
                    payments, schedules, and exceptions.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/company/contact"
                    className="public-button px-6 py-3 text-sm"
                  >
                    Book a workflow review
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/docs/getting-started/quickstart"
                    className="public-button-secondary px-6 py-3 text-sm"
                  >
                    Read the quickstart
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="glass-panel p-5 rounded-xl border-l-2 border-l-blue-500">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                    Sales
                  </div>
                  <a
                    href="mailto:sales@nodebase.space"
                    className="mt-2 flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    sales@nodebase.space
                  </a>
                </div>
                <div className="glass-panel p-5 rounded-xl border-l-2 border-l-purple-500">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                    Trust posture
                  </div>
                  <Link
                    href="/trust"
                    className="mt-2 flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Review controls and legal docs
                  </Link>
                </div>
              </div>
            </div>

            {/* Link groups */}
            <div className="grid gap-8 border-t border-white/5 pt-8 md:grid-cols-[minmax(0,1.1fr)_repeat(4,minmax(0,1fr))]">
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Headquarters
                </div>
                <address className="not-italic text-sm leading-relaxed text-zinc-400">
                  {COMPANY_CONFIG.headquarters.address}
                </address>
                <div className="inline-flex py-1 px-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400">
                  Operating across hospitality, healthcare, commerce, and
                  delivery workflows
                </div>
              </div>

              {footerLinkGroups.map((group) => (
                <nav key={group.title} aria-label={group.title}>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    {group.title}
                  </div>
                  <ul className="mt-5 space-y-3">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col gap-6 border-t border-white/5 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                Copyright {year} Nodebase. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex py-1 px-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-500">
                  System posture: operator controlled
                </span>
                <Link
                  href="/legal/privacy"
                  className="inline-flex py-1 px-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  Privacy
                </Link>
                <Link
                  href="/legal/terms"
                  className="inline-flex py-1 px-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
