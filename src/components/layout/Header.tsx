"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScroll, useMotionValueEvent, AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/ui/Logo";
import { 
  User, 
  CreditCard, 
  LayoutDashboard, 
  Settings, 
  LifeBuoy, 
  LogOut, 
  ChevronDown,
  Wallet,
  Menu,
  X,
  Server
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { t } = useLanguage();
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Kaisa", href: "/products/kaisa", glow: true },
    { name: "Space", href: "/products/space", glow: true },
    { name: t("nav.node"), href: "/node" },
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowDropdown(false);
  };

  // Node Dashboard Link logic
  const nodeDashboardLink = {
    name: "Node Dashboard",
    href: "/node/dashboard",
    icon: Server
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-black/60 backdrop-blur-xl border-white/10 py-3 shadow-lg" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between relative">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="group relative z-50">
            <Logo />
          </Link>
        </div>

        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            
            return (
              <motion.div
                key={item.name}
                animate={{ y: [0, -3, 0] }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: index * 0.2 
                }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive 
                      ? "text-brand-saffron drop-shadow-[0_0_8px_rgba(255,193,7,0.4)]" 
                      : item.glow 
                        ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] shadow-white" 
                        : "text-white/70 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          
          {/* Auth Section */}
          <div className="relative z-50" ref={dropdownRef}>
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="hidden md:inline-flex px-6 py-2.5 text-sm font-medium rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95 bg-white text-black hover:bg-white/90"
                >
                  Login / Signup
                </Link>
                <Link
                  href="/login"
                  className="md:hidden p-2 rounded-full transition-all text-white hover:bg-white/10"
                >
                  <User className="w-5 h-5" />
                </Link>
              </>
            ) : (
              <div>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 p-1 pl-3 pr-2 rounded-full bg-white border border-gray-200 hover:border-gray-300 transition-all shadow-sm group"
                >
                  <div className="flex flex-col items-end mr-1 hidden sm:flex">
                    <span className="text-xs font-bold leading-none text-black">Hudavid</span>
                    <span className="text-[10px] text-gray-500 leading-none mt-1">Pro Plan</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-saffron/10 text-brand-saffron flex items-center justify-center border border-brand-saffron/20">
                    <User className="w-4 h-4" />
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform group-hover:text-gray-600", showDropdown && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden p-2"
                    >
                      {/* User Info Header */}
                      <div className="p-3 bg-gray-50 rounded-xl mb-2">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-medium text-muted-foreground">Active Balance</span>
                           <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Active</span>
                         </div>
                         <div className="flex items-baseline gap-1">
                           <span className="text-2xl font-bold text-black">₹2,450</span>
                           <span className="text-xs text-muted-foreground">.00</span>
                         </div>
                      </div>

                      <div className="space-y-1">
                        <Link href="/node/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-gray-50 hover:text-foreground rounded-lg transition-colors">
                          <Server className="w-4 h-4" />
                          Node Dashboard
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-gray-50 hover:text-foreground rounded-lg transition-colors">
                          <LayoutDashboard className="w-4 h-4" />
                          Switch to Dashboard
                        </Link>
                        <Link href="/billing" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-gray-50 hover:text-foreground rounded-lg transition-colors">
                          <CreditCard className="w-4 h-4" />
                          Billing & Plans
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-gray-50 hover:text-foreground rounded-lg transition-colors">
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <Link href="/dashboard/support" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-gray-50 hover:text-foreground rounded-lg transition-colors">
                          <LifeBuoy className="w-4 h-4" />
                          Support
                        </Link>
                        
                        <div className="h-px bg-gray-100 my-1"></div>
                        
                        <form action={logoutAction} className="w-full">
                          <button 
                            type="submit"
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 rounded-full transition-colors z-50 relative text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu Popout */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Popout Menu */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                closed: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
                open: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.4, bounce: 0.3, staggerChildren: 0.05 } }
              }}
              className="fixed top-16 right-4 w-72 bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 z-50 lg:hidden origin-top-right overflow-hidden"
            >
              <div className="p-3 space-y-2">
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <motion.div
                      key={item.name}
                      variants={{
                        closed: { opacity: 0, x: -10 },
                        open: { opacity: 1, x: 0 }
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-between group active:scale-98",
                          item.glow 
                            ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] bg-white/5" 
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {item.name}
                        <ChevronDown className="-rotate-90 w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity text-white/50" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <motion.div 
                  variants={{
                    closed: { opacity: 0, scaleX: 0 },
                    open: { opacity: 1, scaleX: 1 }
                  }}
                  className="h-px bg-white/10" 
                />

                <motion.div 
                  variants={{
                    closed: { opacity: 0, y: 10 },
                    open: { opacity: 1, y: 0 }
                  }}
                  className="px-3 pb-1"
                >
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-white/60">Language</span>
                     <LanguageSwitcher className="bg-white/5 hover:bg-white/10 text-white border-white/10 scale-90 origin-right" />
                   </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
