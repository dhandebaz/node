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
import Image from "next/image";
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
        "flex items-center gap-3 px-3 py-2.5 md:py-2.5 rounded-2xl transition-all duration-300 group relative",
        active
          ? "bg-omni-indigo text-white shadow-xl shadow-indigo-200 border-b-2 border-indigo-700 active:border-b-0 active:translate-y-[1px]"
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
      )}
    >
      <Icon
        className={cn(
          "w-5 h-5 shrink-0 transition-colors duration-300",
          active ? "text-white" : "text-slate-400 group-hover:text-slate-900",
        )}
      />
      {!collapsed && (
        <span className="text-[13px] font-black uppercase tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300">
          {label}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 whitespace-nowrap shadow-2xl translate-x-[-10px] group-hover:translate-x-0">
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
    { label: "Contacts", icon: Users, href: "/dashboard/ai/customers" },
    { label: "Revenue Pipeline", icon: Calendar, href: "/dashboard/ai/bookings" },
    { label: "Marketing", icon: Megaphone, href: "/dashboard/ai/marketing" },
    { label: "Content Hub", icon: Share2, href: "/dashboard/ai/content" },
    { label: "Catalogs", icon: ShoppingBag, href: "/dashboard/ai/catalog" },
    { label: "Calendar", icon: CalendarDays, href: "/dashboard/ai/calendar" },
    { label: "Engagement", icon: Briefcase, href: "/dashboard/ai/listings" },
    { label: "Strategic Tasks", icon: CheckSquare, href: "/dashboard/ai/tasks" },
    { label: "Integrations", icon: Puzzle, href: "/dashboard/ai/integrations" },
    { label: "Intelligence", icon: BarChart3, href: "/dashboard/ai/insights" },
    { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
  ];

  const bottomItems = [
    { label: "Ledger", icon: CreditCard, href: "/dashboard/billing" },
    { label: "System Config", icon: Settings, href: "/dashboard/ai/settings" },
  ];

  if (isMobile) return null; // We'll handle mobile in the top Navbar

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      whileHover={isCollapsed ? { width: 100 } : {}}
      className={cn(
        "hidden md:flex flex-col sticky top-0 h-screen z-40 bg-white/50 backdrop-blur-3xl border-r border-slate-100 transition-all duration-500 ease-in-out pb-6",
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
      <div className="px-4 space-y-2 mt-auto">
        <div className="h-px bg-slate-100 my-4 mx-2" />
        {bottomItems.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            active={pathname === item.href}
            collapsed={isCollapsed}
          />
        ))}
        
        {/* Mascot Peek */}
        <div className="pt-4 flex justify-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className={cn(
              "relative bg-indigo-50 rounded-2xl border border-indigo-100/50 p-2 transition-all duration-500",
              isCollapsed ? "w-10 h-10" : "w-full flex items-center gap-3 px-4 py-3"
            )}
          >
            <div className="w-6 h-6 relative shrink-0">
               <Image 
                src="/omni_mascot_concept_1_1775828803520.png" 
                alt="Omni" 
                fill 
                className="object-contain" 
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase text-indigo-900 tracking-tighter">Omni Assistant</p>
                <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest truncate">Intelligence Active</p>
              </div>
            )}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
}
