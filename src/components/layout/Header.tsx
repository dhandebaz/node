"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/types/user";
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, CreditCard, Settings, Plug } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  user?: User | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const { host, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Derive display user from either client store (host) or server prop (user)
  const displayUser = host ? {
    name: host.name,
    email: host.email
  } : user ? {
    name: user.profile?.fullName || "User",
    email: user.identity.email
  } : null;

  const isLoggedIn = !!displayUser;

  const navItems = [
    { name: "AI Employees", href: "/employees" },
    { name: "Pricing", href: "/pricing" },
    { name: "Company", href: "/company" },
  ];

  const userMenuItems = [
    { name: "Dashboard", href: "/dashboard/ai", icon: LayoutDashboard },
    { name: "Wallet & Usage", href: "/dashboard/billing", icon: CreditCard },
    { name: "Integrations", href: "/dashboard/ai/integrations", icon: Plug },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-brand-red)] border-b border-white/20">
      <div className="w-full px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="block hover:scale-105 transition-transform duration-200">
          <Logo className="w-10 h-10" />
        </Link>

        {/* Center: Nav Items (Desktop) */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8">
           {!isLoggedIn ? (
             <ul role="list" className="flex items-center gap-8">
               {navItems.map((item) => (
                 <li key={item.href}>
                   <Link 
                     href={item.href}
                     className={cn(
                       "text-sm font-bold uppercase tracking-wider text-white hover:text-white/80 transition-colors",
                       pathname === item.href && "underline decoration-2 underline-offset-4"
                     )}
                   >
                     {item.name}
                   </Link>
                 </li>
               ))}
             </ul>
           ) : (
             <Link 
               href="/dashboard/ai"
               className="bg-white text-[var(--color-brand-red)] hover:bg-gray-100 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors"
             >
               Go to Dashboard
             </Link>
           )}
        </nav>

        {/* Right: Account / User Menu */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <div className="hidden md:flex items-center gap-4">
               <Link 
                 href="/login" 
                 className="text-white font-bold text-sm uppercase tracking-wider hover:underline underline-offset-4"
               >
                 Login
               </Link>
            </div>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors text-white"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                   <UserIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                  {displayUser?.name?.split(' ')[0]}
                </span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{displayUser?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{displayUser?.email}</p>
                    </div>
                    
                    <ul role="list" className="py-1">
                      {userMenuItems.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <item.icon className="w-4 h-4 text-gray-400" />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--color-brand-red)] border-t border-white/20 overflow-hidden"
          >
            <nav aria-label="Mobile Navigation" className="p-6 space-y-4">
              {!isLoggedIn ? (
                 <ul role="list" className="space-y-4">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link 
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-lg font-bold uppercase tracking-wider text-white"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link 
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-lg font-bold uppercase tracking-wider text-white/70"
                      >
                        Login
                      </Link>
                    </li>
                 </ul>
              ) : (
                <div className="space-y-4">
                   <Link 
                     href="/dashboard/ai"
                     onClick={() => setMobileMenuOpen(false)}
                     className="block w-full text-center bg-white text-[var(--color-brand-red)] px-4 py-3 rounded-lg font-bold uppercase tracking-wider"
                   >
                     Go to Dashboard
                   </Link>
                   
                   <div className="pt-4 border-t border-white/20">
                      <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Menu</p>
                      <ul role="list" className="space-y-3">
                        {userMenuItems.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 text-white font-medium"
                            >
                              <item.icon className="w-5 h-5 text-white/70" />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                         <li>
                            <button
                              onClick={() => {
                                logout();
                                setMobileMenuOpen(false);
                              }}
                              className="flex items-center gap-3 text-white/70 font-medium w-full text-left"
                            >
                              <LogOut className="w-5 h-5" />
                              Sign Out
                            </button>
                         </li>
                      </ul>
                   </div>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
