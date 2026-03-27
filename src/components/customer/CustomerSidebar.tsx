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
  BookOpen,
  Wallet,
  HelpCircle,
  Gift,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerSidebarProps {
  roles: UserRoles;
  products: UserProductProfiles;
  kaisaCredits?: KaisaCreditUsage | null;
  tenant?: Tenant;
}

interface NavItemProps {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
}

const NavItem = ({ href, label, icon: Icon, exact = false }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = (path: string, exact = false) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };
  const active = isActive(href, exact);
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium",
        active 
          ? "bg-primary/20 text-primary border-l-2 border-primary shadow-[0_0_15px_rgba(66,133,244,0.15)]" 
          : "text-zinc-400 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-zinc-500")} />
      {label}
    </Link>
  );
};

const SectionLabel = ({ label }: { label: string }) => (
  <div className="px-3 mb-2 mt-6">
    <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">
      {label}
    </span>
  </div>
);

export function CustomerSidebar({ roles, products, kaisaCredits, tenant }: CustomerSidebarProps) {
  const pathname = usePathname();
  const capabilities = getPersonaCapabilities(tenant?.businessType);
  const labels = getBusinessLabels(tenant?.businessType);

  return (
    <aside className="w-64 fixed inset-y-0 left-0 z-50 bg-background/60 backdrop-blur-lg border-r border-white/10 flex flex-col">
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <span className="font-bold text-primary-foreground text-xs">N</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">Nodebase</span>
        </Link>
        {tenant?.earlyAccess && (
          <div className="ml-auto flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded px-1.5 py-0.5">
            <span className="text-[9px] font-bold text-yellow-500 tracking-wide uppercase">Beta</span>
          </div>
        )}
      </div>

      {/* Credit Status (Compact) */}
      {roles.isKaisaUser && kaisaCredits && (
        <div className="p-4 border-b border-white/5">
           <div className="flex items-center justify-between mb-1">
             <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Balance</span>
              <Link href="/dashboard/billing" className="text-[10px] text-primary hover:text-foreground transition-colors">
               Add Funds
             </Link>
           </div>
           <div className="text-xl font-mono font-medium text-foreground">₹{kaisaCredits.balance.toLocaleString()}</div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        
        {roles.isKaisaUser && (
          <div className="space-y-0.5">
            <SectionLabel label="Workspace" />
            <NavItem href="/dashboard/ai" label="Home" icon={LayoutDashboard} exact />
            <NavItem href="/dashboard/ai/inbox" label="Inbox" icon={MessageSquare} />
            
            {capabilities.calendar && (
              <NavItem href="/dashboard/ai/calendar" label="Calendar" icon={CalendarDays} />
            )}
            
            <NavItem href="/dashboard/ai/listings" label={labels.listings} icon={List} />
            <NavItem href="/dashboard/ai/activity" label="Activity" icon={Activity} />
          </div>
        )}

        <div className="space-y-0.5">
          <SectionLabel label="Configuration" />
          <NavItem href="/dashboard/ai/settings" label="AI Rules" icon={Settings2} />
          <NavItem href="/dashboard/ai/integrations" label="Integrations" icon={Puzzle} />
          <NavItem href="/dashboard/billing" label="Billing & Plans" icon={CreditCard} />
          <NavItem href="/dashboard/settings" label="Account" icon={Settings} />
        </div>

        <div className="space-y-0.5">
          <SectionLabel label="Resources" />
          <NavItem href="/docs" label="Documentation" icon={BookOpen} />
          <NavItem href="/dashboard/support" label="Support" icon={HelpCircle} />
          <NavItem href="/dashboard/invite" label="Refer & Earn" icon={Gift} />
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
            {tenant?.businessType?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {tenant?.name || "User Account"}
            </p>
            <p className="text-[10px] text-white/40 truncate">
              {tenant?.businessType || "Standard Plan"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
