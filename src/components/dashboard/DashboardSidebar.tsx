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
  Users,
  Bell,
  Megaphone,
  Share2,
  ShoppingBag,
  Star,
  CheckSquare,
  Award,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

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
          ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100",
      )}
    >
      <Icon
        className={cn(
          "w-5 h-5 shrink-0 transition-colors duration-200",
          active ? "text-white" : "text-zinc-400 group-hover:text-zinc-900",
        )}
      />
      {!collapsed && (
        <span className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
          {label}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-zinc-200">
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
  const { tenant } = useDashboardStore();
  const isHost = tenant?.businessType === "airbnb_host";

  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      // Auto-collapse logic based on width
      if (width >= 768 && width < 1024) {
        setIsCollapsed(true);
      } else if (width >= 1024) {
        setIsCollapsed(false);
      }
    };

    // Use a small delay/timeout if resize feels too aggressive
    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkViewport, 100);
    };

    checkViewport();
    window.addEventListener("resize", debouncedCheck);
    return () => {
      window.removeEventListener("resize", debouncedCheck);
      clearTimeout(timeoutId);
    };
  }, []);

  const menuItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/ai" },
    { label: "Inbox", icon: MessageSquare, href: "/dashboard/ai/inbox" },
    { label: "Customers", icon: Users, href: "/dashboard/ai/customers" },
    { label: "Appointments", icon: Calendar, href: "/dashboard/ai/bookings" },
    { label: "Marketing", icon: Megaphone, href: "/dashboard/ai/marketing" },
    { label: "Content Hub", icon: Share2, href: "/dashboard/ai/content" },
    { label: "Meta Catalog", icon: ShoppingBag, href: "/dashboard/ai/catalog" },
    { label: "Calendar", icon: CalendarDays, href: "/dashboard/ai/calendar" },
    { label: "Services", icon: Briefcase, href: "/dashboard/ai/listings" },
    { label: "Tasks", icon: CheckSquare, href: "/dashboard/ai/tasks" },
    { label: "Integrations", icon: Puzzle, href: "/dashboard/ai/integrations" },
    { label: "Insights", icon: BarChart3, href: "/dashboard/ai/insights" },
    { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
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
        "hidden md:flex flex-col sticky top-0 h-screen z-40 bg-white/80 backdrop-blur-3xl border-r border-zinc-200 transition-all duration-300 ease-in-out pb-6",
        // Enhanced layering for stability on resize
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

        {menuItems.map((item) => {
          const isActive = item.href === "/dashboard/ai" 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
            
          return (
            <SidebarItem
              key={item.href}
              {...item}
              active={isActive}
              collapsed={isCollapsed}
            />
          );
        })}
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
