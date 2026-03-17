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
  Shield,
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
  const { host, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

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
    <header className="public-shell fixed inset-x-0 top-0 z-50">
      <div className="public-container pt-4 sm:pt-5">
        <div className="public-nav-shell rounded-[2rem] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <div className="public-inset flex h-12 w-12 items-center justify-center rounded-[1.4rem] bg-[var(--public-accent)]/95">
                <Logo className="h-8 w-8" />
              </div>
              <div className="hidden sm:block">
                <div className="public-display text-lg text-[var(--public-ink)]">
                  nodebase
                </div>
                <div className="public-eyebrow">
                  AI assistants for your business
                </div>
              </div>
            </Link>

            <nav className="hidden flex-1 items-center justify-center md:flex">
              <div className="public-inset flex items-center gap-1 rounded-full px-2 py-2">
                {publicNavLinks.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                        active
                          ? "bg-[var(--public-accent)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                          : "text-[var(--public-muted)] hover:bg-white/70 hover:text-[var(--public-ink)]",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="ml-auto hidden items-center gap-3 md:flex">
              {isAuthenticated ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="public-button-secondary px-5 py-3 text-sm font-semibold"
                  >
                    Open dashboard
                  </Link>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAccountOpen((open) => !open)}
                      className="public-inset flex items-center gap-3 rounded-full px-3 py-2"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--public-accent)] text-sm font-bold text-white">
                        {initials || "NB"}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-[var(--public-ink)]">
                          {currentViewer.name || "Nodebase account"}
                        </div>
                        <div className="text-xs text-[var(--public-muted)]">
                          {currentViewer.email || "Authenticated"}
                        </div>
                      </div>
                    </button>
                    <AnimatePresence>
                      {accountOpen ? (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.98 }}
                          transition={menuTransition}
                          className="public-panel absolute right-0 top-[calc(100%+0.75rem)] w-72 p-3"
                        >
                          <div className="relative z-10 space-y-2">
                            <Link
                              href={dashboardHref}
                              className="public-inset flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--public-ink)]"
                            >
                              <LayoutDashboard className="h-4 w-4 text-[var(--public-accent-strong)]" />
                              Dashboard
                            </Link>
                            <Link
                              href="/dashboard/billing"
                              className="public-inset flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--public-ink)]"
                            >
                              <CreditCard className="h-4 w-4 text-[var(--public-accent-strong)]" />
                              Billing & usage
                            </Link>
                            <Link
                              href="/dashboard/settings"
                              className="public-inset flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--public-ink)]"
                            >
                              <Settings className="h-4 w-4 text-[var(--public-accent-strong)]" />
                              Settings
                            </Link>
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="public-inset flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[var(--public-ink)]"
                            >
                              <LogOut className="h-4 w-4 text-[var(--public-accent-strong)]" />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="public-button-secondary px-5 py-3 text-sm font-semibold"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="public-button px-5 py-3 text-sm font-semibold"
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="public-inset ml-auto flex h-11 w-11 items-center justify-center rounded-2xl md:hidden"
              aria-label="Toggle navigation"
            >
              {menuOpen ? (
                <X className="h-5 w-5 text-[var(--public-ink)]" />
              ) : (
                <Menu className="h-5 w-5 text-[var(--public-ink)]" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {menuOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={menuTransition}
                className="overflow-hidden md:hidden"
              >
                <div className="mt-4 space-y-3 border-t border-[var(--public-line)] pt-4">
                  {publicNavLinks.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "public-inset flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold",
                          active
                            ? "bg-[var(--public-accent)] text-white"
                            : "text-[var(--public-ink)]",
                        )}
                      >
                        {item.label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    );
                  })}

                  {isAuthenticated ? (
                    <>
                      <Link
                        href={dashboardHref}
                        className="public-button w-full px-5 py-3 text-sm font-semibold"
                      >
                        Open dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="public-button-secondary flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
                      >
                        <Shield className="h-4 w-4" />
                        Account settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="public-button-secondary flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Link
                        href="/login"
                        className="public-button-secondary flex items-center justify-center px-5 py-3 text-sm font-semibold"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        className="public-button flex items-center justify-center px-5 py-3 text-sm font-semibold"
                      >
                        Get Started Free
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
