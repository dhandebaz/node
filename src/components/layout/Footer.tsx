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
        <div className="public-panel px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="relative z-10 space-y-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
              <div className="space-y-5">
                <div className="public-pill public-eyebrow">Public site upgraded</div>
                <div className="flex items-center gap-4">
                  <div className="public-inset flex h-14 w-14 items-center justify-center rounded-[1.6rem] bg-[var(--public-accent)] text-white">
                    <Logo className="h-9 w-9" />
                  </div>
                  <div>
                    <div className="public-display text-2xl text-[var(--public-ink)]">nodebase</div>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--public-muted)] sm:text-base">
                      AI employees for businesses that run on messages, payments, schedules,
                      and exceptions.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/company/contact" className="public-button px-6 py-3 text-sm font-semibold">
                    Book a workflow review
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/docs/getting-started/quickstart"
                    className="public-button-secondary px-6 py-3 text-sm font-semibold"
                  >
                    Read the quickstart
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="public-inset p-4">
                  <div className="public-eyebrow">Sales</div>
                  <a
                    href="mailto:sales@nodebase.space"
                    className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--public-ink)]"
                  >
                    <Mail className="h-4 w-4 text-[var(--public-accent-strong)]" />
                    sales@nodebase.space
                  </a>
                </div>
                <div className="public-inset p-4">
                  <div className="public-eyebrow">Trust posture</div>
                  <Link
                    href="/trust"
                    className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--public-ink)]"
                  >
                    <ShieldCheck className="h-4 w-4 text-[var(--public-accent-strong)]" />
                    Review controls and legal docs
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-8 border-t public-border-line pt-8 md:grid-cols-[minmax(0,1.1fr)_repeat(4,minmax(0,1fr))]">
              <div className="space-y-3">
                <div className="public-eyebrow">Headquarters</div>
                <address className="not-italic text-sm leading-6 text-[var(--public-muted)]">
                  {COMPANY_CONFIG.headquarters.address}
                </address>
                <div className="public-pill text-xs font-semibold text-[var(--public-muted)]">
                  Operating across hospitality, healthcare, commerce, and delivery workflows
                </div>
              </div>

              {footerLinkGroups.map((group) => (
                <nav key={group.title} aria-label={group.title}>
                  <div className="public-eyebrow">{group.title}</div>
                  <ul className="mt-4 space-y-3">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm font-semibold text-[var(--public-muted)] transition-colors hover:text-[var(--public-ink)]"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>

            <div className="flex flex-col gap-4 border-t public-border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--public-muted)]">
                Copyright {year} Nodebase. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="public-pill text-xs font-semibold text-[var(--public-muted)]">
                  System posture: operator controlled
                </span>
                <Link href="/legal/privacy" className="public-pill text-xs font-semibold text-[var(--public-ink)]">
                  Privacy
                </Link>
                <Link href="/legal/terms" className="public-pill text-xs font-semibold text-[var(--public-ink)]">
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
