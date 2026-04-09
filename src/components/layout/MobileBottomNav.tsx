"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Settings,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/ai", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/ai/listings", icon: Briefcase, label: "Services" },
  { href: "/dashboard/ai/bookings", icon: Calendar, label: "Sales" },
  { href: "/dashboard/ai/inbox", icon: MessageSquare, label: "Inbox" },
  { href: "/dashboard/ai/settings", icon: Settings, label: "Settings" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Mobile sticky CTA above the nav  -  visible on small screens to drive conversions */}
      <div className="bg-white/80 backdrop-blur-md border-t border-zinc-100 px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/company/contact"
            className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-950 px-4 py-3 text-sm font-black text-white shadow-xl shadow-zinc-950/20 transition-transform active:scale-95"
            aria-label="Talk to Sales"
          >
            Talk to Sales
          </Link>
        </div>
      </div>

      {/* Main bottom navigation */}
      <div className="bg-white border-t border-zinc-200 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.05)]">
        <nav className="flex justify-around items-center h-16 px-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive
                    ? "text-zinc-950"
                    : "text-zinc-400 hover:text-zinc-950",
                )}
              >
                <item.icon
                  className="w-5 h-5 transition-transform duration-200"
                  style={{ transform: isActive ? "scale(1.1)" : "scale(1)" }}
                  strokeWidth={isActive ? 3 : 2}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
