"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CreditCard, 
  Puzzle, 
  Settings, 
  User, 
  LogOut,
  Menu,
  X 
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface UniversalNavbarProps {
  tenantName?: string;
  userEmail?: string;
  userAvatar?: string;
  credits?: any; // To avoid type issues for now, or import KaisaCreditUsage
  isKaisaUser?: boolean;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Integrations", href: "/dashboard/ai/integrations", icon: Puzzle },
];

export function UniversalNavbar({ tenantName, userEmail, userAvatar, credits, isKaisaUser }: UniversalNavbarProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Generate initials from business name or fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const initials = tenantName ? getInitials(tenantName) : "NB";
  // Generate a consistent brand color based on the name (simple hash)
  const getColor = (name: string) => {
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  
  const avatarBg = tenantName ? getColor(tenantName) : "bg-zinc-700";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-b border-border/50 flex items-center justify-between px-4 md:px-6 select-none shadow-sm">
        {/* Left Zone: Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-8 h-8">
              <Logo />
            </div>
            {/* Removed the all caps NODEBASE wordmark as requested */}
          </Link>
        </div>

        {/* Center Zone: Tabs (Desktop) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 glass-panel rounded-full p-1 border border-white/10">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon size={14} className={isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Zone: User Profile */}
        <div 
          className="relative"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button 
            className="flex items-center gap-3 outline-none group"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{tenantName || "My Business"}</div>
              <div className="text-xs text-muted-foreground hidden lg:block max-w-[150px] truncate">{userEmail}</div>
            </div>
            <Avatar className={cn("w-9 h-9 border border-border transition-transform group-hover:scale-105", avatarBg)}>
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="text-white font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-2xl overflow-hidden py-1 z-[60]"
              >
                <div className="px-3 py-2 border-b border-border mb-1 sm:hidden">
                  <p className="text-xs font-medium text-foreground truncate">{tenantName || "My Business"}</p>
                  <p className="text-[10px] font-medium text-muted-foreground truncate">{userEmail}</p>
                </div>
                <div className="px-3 py-2 border-b border-border mb-1 hidden sm:block">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Account</p>
                </div>
                
                <Link 
                  href="/dashboard/settings" 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings size={16} />
                  Quick Settings
                </Link>
                
                <Link 
                  href="/dashboard/account" 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User size={16} />
                  Account
                </Link>
                
                <div className="h-px bg-white/5 my-1" />
                
                <form action={logoutAction}>
                  <button 
                    type="submit"
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-16 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl border-b border-border/50 z-40 md:hidden overflow-hidden shadow-md"
          >
            <div className="flex flex-col p-4 gap-3">
              <div className="mb-1 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Navigation</div>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground rounded-xl shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl"
                    )}
                  >
                    <item.icon size={20} className={isActive ? "text-primary-foreground" : "text-muted-foreground"} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
