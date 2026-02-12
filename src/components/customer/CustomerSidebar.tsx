"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserProductProfiles, UserRoles } from "@/types/user";
import { KaisaCreditUsage } from "@/types/kaisa";
import { Tenant } from "@/types";
import { getBusinessLabels, getPersonaCapabilities } from "@/lib/business-context";
import { 
  LayoutDashboard, 
  MessageSquare, 
  List, 
  CalendarDays, 
  Settings2, 
  Activity, 
  Puzzle, 
  CreditCard, 
  Settings,
  Globe,
  Library,
  BookOpen,
  Wallet,
  HelpCircle,
  Gift,
  Sparkles
} from "lucide-react";

interface CustomerSidebarProps {
  roles: UserRoles;
  products: UserProductProfiles;
  kaisaCredits?: KaisaCreditUsage | null;
  tenant?: Tenant;
}

export function CustomerSidebar({ roles, products, kaisaCredits, tenant }: CustomerSidebarProps) {
  const pathname = usePathname();
  const labels = getBusinessLabels(tenant?.businessType);
  const capabilities = getPersonaCapabilities(tenant?.businessType);

  // Helper to determine if a link is active
  const isActive = (path: string, exact = false) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };

  const NavItem = ({ href, label, icon: Icon, exact = false }: { href: string; label: string; icon: any; exact?: boolean }) => {
    const active = isActive(href, exact);
    return (
      <Link 
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${
          active 
            ? "bg-white/10 text-white font-medium" 
            : "text-white/70 hover:text-white hover:bg-white/5"
        }`}
      >
        <Icon className={`w-4 h-4 ${active ? "text-white" : "text-white/70 group-hover:text-white"}`} />
        <span className="text-sm">{label}</span>
      </Link>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="px-3 mb-2 mt-6">
      <span className="text-xs font-bold uppercase tracking-widest text-white/40">
        {label}
      </span>
    </div>
  );

  return (
    <aside className="w-64 fixed inset-y-0 left-0 z-50 bg-[var(--color-brand-red)] border-r border-white/10 flex flex-col shadow-xl">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 bg-white/5 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">NODEBASE</span>
        </Link>
        {tenant?.earlyAccess && (
          <div className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 rounded px-1.5 py-0.5" title="Early Access Member">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span className="text-[9px] font-bold text-yellow-400 tracking-wide uppercase">Beta</span>
          </div>
        )}
      </div>

      {/* Credit Status (Only for AI Users) */}
      {roles.isKaisaUser && kaisaCredits && (
        <div className="p-4 border-b border-white/10 bg-black/10">
           <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Wage Balance</div>
           <div className="text-2xl font-mono font-medium text-white">₹{kaisaCredits.balance.toLocaleString()}</div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        
        {/* AI Employee Menu */}
        {roles.isKaisaUser && (
          <div className="space-y-1">
            <SectionLabel label="AI Employee" />
            <NavItem href="/dashboard/ai/inbox" label="Inbox" icon={MessageSquare} />
            <NavItem href="/dashboard/ai/listings" label={labels.listings} icon={List} />
            <NavItem href="/dashboard/ai/bookings" label={labels.bookings} icon={BookOpen} />
            {capabilities.calendar && (
              <NavItem href="/dashboard/ai/calendar" label={labels.calendar} icon={CalendarDays} />
            )}
            <NavItem href="/dashboard/ai/settings" label="AI Settings" icon={Settings2} />
            <NavItem href="/dashboard/ai/activity" label="AI Activity" icon={Activity} />
            <NavItem href="/dashboard/ai/integrations" label="Integrations" icon={Puzzle} />
            <NavItem href="/dashboard/billing" label="Wallet & Usage" icon={Wallet} />
          </div>
        )}

        {/* Nodebase Space Menu */}
        {roles.isSpaceUser && (
          <div className="space-y-1">
            <SectionLabel label="Space" />
            <NavItem href="/dashboard/space" label="Overview" icon={LayoutDashboard} exact />
            <NavItem href="/dashboard/space/websites" label="Websites" icon={Globe} />
            <NavItem href="/dashboard/space/resources" label="Resources" icon={Library} />
          </div>
        )}

        {/* System Menu (Shared) */}
        <div className="space-y-1">
          <SectionLabel label="System" />
          <NavItem href="/dashboard/billing" label="Billing" icon={CreditCard} />
          <NavItem href="/dashboard/settings" label="Settings" icon={Settings} />
          <NavItem href="/dashboard/invite" label="Invite & Earn" icon={Gift} />
          <NavItem 
            href="/dashboard/support" 
            label={tenant?.earlyAccess ? "Priority Support" : "Need help?"} 
            icon={HelpCircle} 
          />
        </div>
      </nav>
      
      {/* User Profile / Footer could go here */}
    </aside>
  );
}
