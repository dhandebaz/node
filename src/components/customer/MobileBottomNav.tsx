"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Calendar, CreditCard, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Home",
      href: "/dashboard/kaisa",
      icon: Home,
      isActive: (path: string) => path === "/dashboard/kaisa" || path === "/dashboard",
    },
    {
      name: "Inbox",
      href: "/dashboard/inbox",
      icon: MessageSquare,
      isActive: (path: string) => path.startsWith("/dashboard/inbox"),
    },
    {
      name: "Calendar",
      href: "/dashboard/calendar",
      icon: Calendar,
      isActive: (path: string) => path.startsWith("/dashboard/calendar"),
    },
    {
      name: "Wallet",
      href: "/dashboard/kaisa/wallet",
      icon: CreditCard,
      isActive: (path: string) => path.startsWith("/dashboard/kaisa/wallet"),
    },
    {
      name: "More",
      href: "/dashboard/more",
      icon: Menu,
      isActive: (path: string) => path.startsWith("/dashboard/more"),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#2A0A0A] border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = tab.isActive(pathname);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                active ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              <tab.icon className={cn("w-6 h-6", active && "fill-current/20")} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
