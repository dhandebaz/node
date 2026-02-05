
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Box, 
  Server, 
  LifeBuoy, 
  Settings, 
  LogOut,
  ChevronRight,
  CreditCard,
  Sparkles
} from "lucide-react";
import { UserProductProfiles, UserRoles } from "@/types/user";
import { logoutAction } from "@/app/actions/auth";
import { KaisaCreditUsage } from "@/types/kaisa";

interface CustomerSidebarProps {
  roles: UserRoles;
  products: UserProductProfiles;
  kaisaCredits?: KaisaCreditUsage | null;
}

export function CustomerSidebar({ roles, products, kaisaCredits }: CustomerSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);
  const isKaisaDashboard = pathname.startsWith("/dashboard/kaisa");

  return (
    <aside className="w-64 fixed inset-y-0 left-0 z-50 bg-black/80 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        {isKaisaDashboard && kaisaCredits ? (
           <div className="flex flex-col w-full">
             <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Wage Balance</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">₹{kaisaCredits.balance}</span>
                <button className="text-xs bg-brand-saffron/10 text-brand-saffron hover:bg-brand-saffron/20 px-2 py-1 rounded transition-colors font-medium">
                  Top Up
                </button>
             </div>
           </div>
        ) : (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-saffron to-brand-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-white font-bold tracking-tight">Nodebase</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        
        {/* Kaisa Section */}
        {roles.isKaisaUser && (
          <div className="space-y-1">
            <div className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
              kaisa AI
            </div>
            <Link 
              href="/dashboard/kaisa"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive("/dashboard/kaisa") && !pathname.includes("modules") && !pathname.includes("tasks")
                  ? "bg-blue-500/10 text-blue-400" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Box className="w-4 h-4" />
              <span className="text-sm">Overview</span>
            </Link>
            <Link 
              href="/dashboard/kaisa/tasks"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive("/dashboard/kaisa/tasks")
                  ? "bg-blue-500/10 text-blue-400" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm">Tasks & Ops</span>
            </Link>
             <Link 
              href="/dashboard/kaisa/modules"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive("/dashboard/kaisa/modules")
                  ? "bg-blue-500/10 text-blue-400" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Box className="w-4 h-4" />
              <span className="text-sm">Modules</span>
            </Link>
             <Link 
              href="/dashboard/kaisa/activity"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive("/dashboard/kaisa/activity")
                  ? "bg-blue-500/10 text-blue-400" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm">Activity</span>
            </Link>
            <Link 
              href="/dashboard/kaisa/learning"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive("/dashboard/kaisa/learning")
                  ? "bg-blue-500/10 text-blue-400" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Learning</span>
            </Link>
          </div>
        )}

        {/* Space Section */}
        {roles.isSpaceUser && (
          <div className="space-y-1">
             {roles.isKaisaUser && <div className="h-px bg-white/5 my-4" />}
            <div className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
              Space Cloud
            </div>
            <Link 
              href="/dashboard/space"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive("/dashboard/space") && !pathname.includes("websites") && !pathname.includes("resources")
                  ? "bg-purple-500/10 text-purple-400" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Server className="w-4 h-4" />
              <span className="text-sm">Overview</span>
            </Link>
             <Link 
              href="/dashboard/space/websites"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive("/dashboard/space/websites")
                  ? "bg-purple-500/10 text-purple-400" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Box className="w-4 h-4" />
              <span className="text-sm">Websites</span>
            </Link>
             <Link 
              href="/dashboard/space/resources"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive("/dashboard/space/resources")
                  ? "bg-purple-500/10 text-purple-400" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Server className="w-4 h-4" />
              <span className="text-sm">Resources</span>
            </Link>
          </div>
        )}

        {/* General Section */}
        <div className="space-y-1 pt-4 border-t border-white/5">
           <Link 
            href="/dashboard/support"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive("/dashboard/support")
                ? "bg-white/10 text-white" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span className="text-sm">Support</span>
          </Link>
          <Link 
            href="/dashboard/billing"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive("/dashboard/billing")
                ? "bg-white/10 text-white" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-sm">Billing & Payments</span>
          </Link>
          <Link 
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive("/dashboard/settings")
                ? "bg-white/10 text-white" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <form action={logoutAction}>
            <button 
                type="submit"
                className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
            </button>
        </form>
      </div>
    </aside>
  );
}
