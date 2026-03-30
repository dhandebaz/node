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
  { href: "/dashboard/ai/listings", icon: Briefcase, label: "Listings" },
  { href: "/dashboard/ai/bookings", icon: Calendar, label: "Bookings" },
  { href: "/dashboard/ai/inbox", icon: MessageSquare, label: "Inbox" },
  { href: "/dashboard/ai/settings", icon: Settings, label: "Settings" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Mobile sticky CTA above the nav  -  visible on small screens to drive conversions */}
      <div className="bg-background border-t border-border px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/company/contact"
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
            aria-label="Talk to Sales"
          >
            Talk to Sales
          </Link>
        </div>
      </div>

      {/* Main bottom navigation */}
      <div className="bg-background border-t border-border pb-safe">
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
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.5 : 2}
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
