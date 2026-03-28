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
    <div className="space-y-6">
      {/* Sidebar header */}
      <div className="glass-panel p-6 rounded-[2rem]">
        <div className="relative z-10">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl text-white tracking-tighter">
                Build with control
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Start with the operating model, then move into APIs and
                integration rails.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="glass-panel p-5 rounded-[2rem]">
        <div className="space-y-5">
          {docsNavigation.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: sectionIndex * 0.08 }}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-2">
                {section.title}
              </div>
              <ul className="mt-3 space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          isActive
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}

          {/* Help callout */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <LifeBuoy className="h-4 w-4 text-blue-400" />
              Need rollout help?
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              If the docs do not answer a deployment question, route it to the
              team directly.
            </p>
            <Link
              href="/company/contact"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
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
