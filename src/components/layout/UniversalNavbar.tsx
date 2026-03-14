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
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-6 select-none">
        {/* Left Zone: Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden text-zinc-400 hover:text-white transition-colors"
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
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={14} className={isActive ? "text-black" : "text-zinc-400 group-hover:text-white"} />
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
              <div className="text-sm font-medium text-white group-hover:text-zinc-200">{tenantName || "My Business"}</div>
              <div className="text-xs text-zinc-500 hidden lg:block max-w-[150px] truncate">{userEmail}</div>
            </div>
            <Avatar className={cn("w-9 h-9 border border-white/10 transition-transform group-hover:scale-105", avatarBg)}>
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
                className="absolute right-0 top-full mt-2 w-56 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1"
              >
                <div className="px-3 py-2 border-b border-white/5 mb-1 sm:hidden">
                  <p className="text-xs font-medium text-zinc-200 truncate">{tenantName || "My Business"}</p>
                  <p className="text-[10px] font-medium text-zinc-500 truncate">{userEmail}</p>
                </div>
                <div className="px-3 py-2 border-b border-white/5 mb-1 hidden sm:block">
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">My Account</p>
                </div>
                
                <Link 
                  href="/dashboard/settings" 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings size={16} />
                  Quick Settings
                </Link>
                
                <Link 
                  href="/dashboard/account" 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
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
            className="fixed top-16 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/10 z-40 md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              <div className="mb-2 px-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">Navigation</div>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white text-black"
                        : "text-zinc-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon size={18} className={isActive ? "text-black" : "text-zinc-400"} />
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
