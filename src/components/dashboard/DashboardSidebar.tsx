"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  CalendarDays,
  Briefcase,
  BarChart3,
  Settings,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active: boolean;
  collapsed: boolean;
}

function SidebarItem({
  icon: Icon,
  label,
  href,
  active,
  collapsed,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5",
      )}
    >
      <Icon
        className={cn(
          "w-5 h-5 shrink-0",
          active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
        )}
      />
      {!collapsed && (
        <span className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
          {label}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-white/10">
          {label}
        </div>
      )}
    </Link>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 1024) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/ai" },
    { label: "Inbox", icon: MessageSquare, href: "/dashboard/ai/inbox" },
    { label: "Bookings", icon: Calendar, href: "/dashboard/ai/bookings" },
    { label: "Calendar", icon: CalendarDays, href: "/dashboard/ai/calendar" },
    { label: "Listings", icon: Briefcase, href: "/dashboard/ai/listings" },
    { label: "Insights", icon: BarChart3, href: "/dashboard/ai/insights" },
    { label: "Integrations", icon: Puzzle, href: "/dashboard/ai/integrations" },
  ];

  const bottomItems = [
    { label: "Billing", icon: CreditCard, href: "/dashboard/billing" },
    { label: "Settings", icon: Settings, href: "/dashboard/ai/settings" },
  ];

  if (isMobile) return null; // We'll handle mobile in the top Navbar

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-r border-border/50 flex flex-col transition-all duration-300 ease-in-out",
        "pt-20 pb-6", // Offset for top navbar
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-background border border-border/50 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-50 shadow-sm"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Internal Navigation */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        <div className="mb-4 px-2">
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Main Menu
            </div>
          )}
          {isCollapsed && <div className="h-px bg-white/5 my-4" />}
        </div>

        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            active={pathname === item.href}
            collapsed={isCollapsed}
          />
        ))}
      </div>

      {/* Bottom Section */}
      <div className="px-4 space-y-2">
        <div className="h-px bg-white/5 my-4 mx-2" />
        {bottomItems.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            active={pathname === item.href}
            collapsed={isCollapsed}
          />
        ))}
      </div>
    </motion.aside>
  );
}
