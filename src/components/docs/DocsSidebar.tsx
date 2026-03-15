"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenText, LifeBuoy } from "lucide-react";
import { docsNavigation } from "@/lib/public-content";
import { cn } from "@/lib/utils";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <div className="public-panel p-5">
        <div className="relative z-10">
          <div className="public-pill public-eyebrow">Docs navigation</div>
          <div className="mt-4 flex items-start gap-3">
            <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="public-display text-2xl text-[var(--public-ink)]">Build with control</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">
                Start with the operating model, then move into APIs and integration rails.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="public-panel-soft p-4">
        <div className="space-y-5">
          {docsNavigation.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: sectionIndex * 0.08 }}
            >
              <div className="public-eyebrow px-2">{section.title}</div>
              <ul className="mt-3 space-y-2">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "public-inset flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                          isActive
                            ? "bg-[var(--public-accent)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]"
                            : "text-[var(--public-ink)] hover:-translate-y-0.5",
                        )}
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}

          <div className="rounded-[1.4rem] border border-[var(--public-line)] bg-[var(--public-accent-soft)]/65 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--public-ink)]">
              <LifeBuoy className="h-4 w-4 text-[var(--public-accent-strong)]" />
              Need rollout help?
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">
              If the docs do not answer a deployment question, route it to the team directly.
            </p>
            <Link
              href="/company/contact"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-accent-strong)]"
            >
              Contact Nodebase
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
