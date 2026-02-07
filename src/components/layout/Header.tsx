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
    { name: "Space", href: "/space" },
    { name: "Node", href: "/node" },
  ];

  const employeesMenuItems = [
    { name: "Overview", href: "/employees" },
    { name: "Host AI", href: "/employees/host-ai" },
    { name: "Nurse AI", href: "/employees/nurse-ai" },
    { name: "Dukan AI", href: "/employees/dukan-ai" },
    { name: "Thrift AI", href: "/employees/thrift-ai" },
  ];

  const userMenuItems = [
    { name: "Dashboard", href: "/dashboard/kaisa", icon: LayoutDashboard },
    { name: "Wallet & Usage", href: "/dashboard/kaisa/wallet", icon: CreditCard },
    { name: "Integrations", href: "/dashboard/integrations", icon: Plug },
    { name: "Settings", href: "/dashboard/kaisa/settings", icon: Settings },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-brand-red)] border-b border-white/20">
      <div className="w-full px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="block hover:scale-105 transition-transform duration-200">
          <Logo className="w-10 h-10" />
        </Link>

        {/* Center: Nav Items (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium tracking-wide transition-opacity duration-200 text-white",
                pathname.startsWith(item.href)
                  ? "opacity-100 border-b border-white"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right: Account / User Menu */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <Link 
              href="/login" 
              className="hidden md:flex items-center gap-2 text-white/70 hover:text-white font-medium text-sm transition-colors"
            >
              <UserIcon className="w-5 h-5" />
              <span>Account</span>
            </Link>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors text-white"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                   <UserIcon className="w-4 h-4" />
                </div>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl overflow-hidden py-2"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-bold text-gray-900">{displayUser?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{displayUser?.email}</p>
                    </div>
                    
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-gray-400" />
                        {item.name}
                      </Link>
                    ))}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
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
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {pathname.startsWith("/employees") && (
        <div className="w-full border-t border-white/10 bg-[var(--color-brand-red)]">
          <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
            <nav className="flex items-center gap-8 h-12 min-w-max">
              {employeesMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest transition-colors relative h-full flex items-center",
                    pathname === item.href ? "text-white opacity-100" : "text-white opacity-50 hover:opacity-100"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden bg-[var(--color-brand-red)] border-b border-white/10 overflow-hidden"
          >
             <nav className="flex flex-col p-6 gap-4">
              <div className="text-xs font-bold uppercase tracking-widest text-white/60">
                AI Employees
              </div>
              {employeesMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-white/90 hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-white/10 my-2" />
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-white/90 hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
              {!isLoggedIn ? (
                 <Link
                   href="/login"
                   onClick={() => setMobileMenuOpen(false)}
                   className="text-lg font-medium text-white/90 hover:text-white flex items-center gap-2 pt-4 border-t border-white/10"
                 >
                   <UserIcon className="w-5 h-5" />
                   Account (Login)
                 </Link>
              ) : (
                <>
                  <div className="pt-4 border-t border-white/10 text-white/60 text-xs uppercase tracking-widest font-bold mb-2">My Account</div>
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-white/90 hover:text-white"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-white/90 hover:text-white pt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              )}
             </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
