"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  const isKaisaDashboard = pathname.includes("/kaisa");

  const NavItem = ({ href, label, exact = false }: { href: string; label: string; exact?: boolean }) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link 
        href={href}
        className={`block text-sm font-bold uppercase tracking-wider py-2 transition-opacity ${
          active ? "opacity-100 border-l-2 border-white pl-3" : "opacity-60 hover:opacity-100 pl-3 border-l-2 border-transparent"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-64 fixed inset-y-0 left-0 z-50 bg-[var(--color-brand-red)] border-r border-white/20 flex flex-col">
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-white/20">
        <Link href="/" className="text-xl font-bold uppercase tracking-tighter">
          Nodebase
        </Link>
      </div>

      {/* Credit Status (if applicable) */}
      {isKaisaDashboard && kaisaCredits && (
        <div className="p-6 border-b border-white/20">
           <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Wage Balance</div>
           <div className="text-3xl font-mono font-medium">₹{kaisaCredits.balance}</div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-12 overflow-y-auto custom-scrollbar">
        
        {/* Kaisa Section */}
        {roles.isKaisaUser && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest opacity-40">
              Operations
            </div>
            <div className="space-y-1">
              <NavItem href="/dashboard/kaisa" label="Overview" exact />
              <NavItem href="/dashboard/kaisa/tasks" label="Tasks" />
              <NavItem href="/dashboard/kaisa/modules" label="Modules" />
              <NavItem href="/dashboard/kaisa/activity" label="Activity" />
            </div>
          </div>
        )}

        {/* Space Section */}
        {roles.isSpaceUser && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest opacity-40">
              Infrastructure
            </div>
            <div className="space-y-1">
              <NavItem href="/dashboard/space" label="Overview" exact />
              <NavItem href="/dashboard/space/websites" label="Websites" />
              <NavItem href="/dashboard/space/resources" label="Resources" />
            </div>
          </div>
        )}

        {/* Account Section */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest opacity-40">
            System
          </div>
          <div className="space-y-1">
            <NavItem href="/dashboard/inbox" label="Inbox" />
            <NavItem href="/dashboard/ai-settings" label="AI Settings" />
            <NavItem href="/dashboard/ai-activity" label="AI Activity" />
            <NavItem href="/dashboard/integrations" label="Integrations" />
            <NavItem href="/dashboard/billing" label="Billing" />
            <NavItem href="/dashboard/support" label="Support" />
            <NavItem href="/dashboard/settings" label="Settings" />
          </div>
        </div>
      </nav>

      {/* Footer / Logout */}
      <div className="p-6 border-t border-white/20">
        <button 
          onClick={() => logoutAction()}
          className="text-sm font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
