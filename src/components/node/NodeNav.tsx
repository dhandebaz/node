"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NodeNav() {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/node" },
    { name: "How it Works", href: "/node/how-it-works" },
    { name: "Infrastructure", href: "/node/infrastructure" },
    { name: "Nodes", href: "/node/nodes" },
    { name: "Risk", href: "/node/risk" },
    { name: "FAQ", href: "/node/faq" },
  ];

  return (
    <div className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-16 z-40">
      <div className="container mx-auto px-6 overflow-x-auto">
        <nav className="flex items-center gap-6 md:gap-8 h-12 min-w-max">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative h-full flex items-center",
                  isActive
                    ? "text-brand-saffron"
                    : "text-white/60 hover:text-white"
                )}
              >
                {link.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-saffron shadow-[0_0_10px_rgba(255,153,51,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
