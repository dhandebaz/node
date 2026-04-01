"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { publicNavLinks } from "@/lib/public-content";
import { useAuthStore } from "@/store/useAuthStore";

interface HeaderViewer {
  authenticated?: boolean;
  name?: string | null;
  email?: string | null;
  dashboardHref?: string;
}

interface HeaderProps {
  viewer?: HeaderViewer | null;
}

const menuTransition = { duration: 0.2, ease: "easeOut" } as const;

export function Header({ viewer }: HeaderProps) {
  const pathname = usePathname();
  const { host, fetchHost, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    // Only fetch if not already in store
    if (!host) {
      fetchHost();
    }
  }, [host, fetchHost]);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const currentViewer = useMemo(() => {
    if (host) {
      return {
        authenticated: true,
        name: host.name,
        email: host.email,
        dashboardHref: "/dashboard/ai",
      };
    }

    if (viewer?.authenticated) {
      return {
        authenticated: true,
        name: viewer.name,
        email: viewer.email,
        dashboardHref: viewer.dashboardHref || "/dashboard/ai",
      };
    }

    return {
      authenticated: false,
      name: null,
      email: null,
      dashboardHref: "/dashboard/ai",
    };
  }, [host, viewer]);

  const isAuthenticated = currentViewer.authenticated === true;
  const dashboardHref = currentViewer.dashboardHref || "/dashboard/ai";
  const initials = (currentViewer.name || currentViewer.email || "NB")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    logout();
    window.location.assign("/");
  };

  return (
    <header className="fixed left-1/2 top-4 z-[100] w-full max-w-6xl -translate-x-1/2 px-4 sm:top-6 sm:px-6">
      <div 
        className={cn(
          "glass-nav flex flex-col px-4 py-3 sm:px-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300",
          menuOpen ? "rounded-[2rem]" : "rounded-full"
        )}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex shrink-0 items-center group">
              <Logo className="text-white group-hover:opacity-80 transition-opacity" />
            </Link>

            <div className="hidden md:flex items-center gap-1 rounded-full p-1 bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              {publicNavLinks.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all",
                      active
                        ? "bg-white/10 text-white border border-white/10 shadow-[inner_0_1px_1px_rgba(255,255,255,0.05)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Link
                  href={dashboardHref}
                  className="rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 hover:border-white/20 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                >
                  Dashboard
                </Link>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((open) => !open)}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 pr-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[10px] font-bold text-white shadow-inner">
                      {initials || "NB"}
                    </div>
                    <span className="text-xs font-semibold text-zinc-300">
                      {currentViewer.name?.split(" ")[0] || "Account"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {accountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={menuTransition}
                        className="glass-panel absolute right-0 top-[calc(100%+0.75rem)] w-64 p-2 rounded-2xl"
                      >
                        <div className="relative z-10 space-y-1">
                          <Link
                            href={dashboardHref}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <LayoutDashboard className="h-4 w-4 text-blue-400" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/billing"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <CreditCard className="h-4 w-4 text-blue-400" />
                            Billing & usage
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <Settings className="h-4 w-4 text-blue-400" />
                            Settings
                          </Link>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-medium text-zinc-400 hover:text-white transition-colors px-2"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 border border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] px-4 py-2 text-xs font-semibold text-white hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  Deploy AI
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 md:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? (
              <X className="h-4 w-4 text-zinc-300" />
            ) : (
              <Menu className="h-4 w-4 text-zinc-300" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={menuTransition}
              className="overflow-hidden md:hidden w-full flex-shrink-0"
            >
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4 pb-2">
                {publicNavLinks.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                        active ? "bg-white/10 text-white" : "text-zinc-400"
                      )}
                    >
                      {item.label}
                      <ArrowRight className="h-4 w-4 opacity-50" />
                    </Link>
                  );
                })}

                <div className="h-px w-full bg-white/5 my-2" />

                {isAuthenticated ? (
                  <div className="grid gap-2">
                    <Link
                      href={dashboardHref}
                      className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg"
                    >
                      Open dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-zinc-400 hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-2 pt-2">
                    <Link
                      href="/signup"
                      className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 border border-blue-400/50 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                    >
                      Deploy AI Free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300"
                    >
                      Log in
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
