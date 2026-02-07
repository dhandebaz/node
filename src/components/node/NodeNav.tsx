
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NodeNav() {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/node" },
    { name: "Nodes", href: "/node/nodes" },
    { name: "How it Works", href: "/node/how-it-works" },
    { name: "Risk", href: "/node/risk" },
    { name: "FAQ", href: "/node/faq" },
  ];

  return (
    <div className="w-full border-b border-white/20 bg-[var(--color-brand-red)] sticky top-[64px] z-40 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--color-brand-red)]/95">
      <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-8 h-12 min-w-max">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs font-bold uppercase tracking-widest transition-colors relative h-full flex items-center",
                  isActive
                    ? "text-white opacity-100"
                    : "text-white opacity-50 hover:opacity-100"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
