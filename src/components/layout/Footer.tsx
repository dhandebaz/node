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
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
              <div className="space-y-6">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Public site upgraded</div>
                <div className="flex items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                    <Logo className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <div className="font-display text-3xl text-foreground uppercase tracking-tighter leading-none">nodebase</div>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground font-sans">
                      AI employees for businesses that run on messages, payments, schedules,
                      and exceptions.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/company/contact" className="public-button px-8 py-4 text-sm">
                    Book a workflow review
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/docs/getting-started/quickstart"
                    className="public-button-secondary px-8 py-4 text-sm"
                  >
                    Read the quickstart
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="public-inset p-5 border-l-4 border-l-primary/10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary">Sales</div>
                  <a
                    href="mailto:sales@nodebase.space"
                    className="mt-3 flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    sales@nodebase.space
                  </a>
                </div>
                <div className="public-inset p-5 border-l-4 border-l-primary/10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary">Trust posture</div>
                  <Link
                    href="/trust"
                    className="mt-3 flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Review controls and legal docs
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-8 border-t public-border-line pt-8 md:grid-cols-[minmax(0,1.1fr)_repeat(4,minmax(0,1fr))]">
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-primary">Headquarters</div>
                <address className="not-italic text-sm leading-relaxed text-muted-foreground font-sans">
                  {COMPANY_CONFIG.headquarters.address}
                </address>
                <div className="inline-flex py-1 px-3 rounded-full bg-primary/5 text-primary border border-primary/10 text-[10px] font-bold uppercase tracking-tight">
                  Operating across hospitality, healthcare, commerce, and delivery workflows
                </div>
              </div>

              {footerLinkGroups.map((group) => (
                <nav key={group.title} aria-label={group.title}>
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary">{group.title}</div>
                  <ul className="mt-5 space-y-3">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>

            <div className="flex flex-col gap-6 border-t border-border/40 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">
                Copyright {year} Nodebase. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex py-1 px-3 rounded-full bg-muted border border-border text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                  System posture: operator controlled
                </span>
                <Link href="/legal/privacy" className="inline-flex py-1 px-3 rounded-full bg-muted border border-border text-[10px] font-bold uppercase tracking-tight text-foreground hover:bg-muted/80 transition-colors">
                  Privacy
                </Link>
                <Link href="/legal/terms" className="inline-flex py-1 px-3 rounded-full bg-muted border border-border text-[10px] font-bold uppercase tracking-tight text-foreground hover:bg-muted/80 transition-colors">
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
