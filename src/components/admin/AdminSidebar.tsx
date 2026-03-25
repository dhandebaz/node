"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminLogoutAction } from "@/app/actions/auth";
import { 
  LayoutDashboard, 
  Users, 
  Cpu, 
  DollarSign,
  Wallet,
  Plug,
  FileText, 
  Settings, 
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ClipboardList,
  AlertTriangle,
  Flag,
  Rocket,
  TrendingUp,
  Code
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";

const navItems = [
  { name: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { name: "Vibecoding", href: "/admin/vibecoding", icon: Code },
  { name: "AI Managers", href: "/admin/ai-managers", icon: Cpu },
  { name: "AI Rules", href: "/admin/ai-rules", icon: ShieldCheck },
  { name: "Pricing & Costs", href: "/admin/pricing", icon: DollarSign },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Growth & Referrals", href: "/admin/growth", icon: TrendingUp },
  { name: "Usage & Wallets", href: "/admin/usage", icon: Wallet },
  { name: "Integrations Health", href: "/admin/integrations", icon: Plug },
  { name: "System Failures", href: "/admin/failures", icon: AlertTriangle },
  { name: "Launch Control", href: "/admin/launch", icon: Rocket },
  { name: "System Controls", href: "/admin/system", icon: Settings },
  { name: "Feature Flags", href: "/admin/features", icon: Flag },
  { name: "Audit Logs", href: "/admin/audit", icon: ClipboardList },
  { name: "System Logs", href: "/admin/logs", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-card border border-border rounded-lg text-foreground shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "fixed md:sticky top-0 left-0 h-screen w-72 bg-card border-r border-border flex flex-col z-40 transition-transform duration-300 md:translate-x-0 shrink-0 shadow-xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="h-20 flex items-center px-6 border-b border-border/50 shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
             <Logo className="w-8 h-8 text-primary shadow-sm group-hover:scale-110 transition-transform" />
             <div>
                <h1 className="text-xl font-bold uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">Nodebase</h1>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block mt-0.5">Admin Console</span>
             </div>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <ul className="space-y-1 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "opacity-70 group-hover:opacity-100")} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 shrink-0 pb-safe">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-muted/30 rounded-xl border border-border/50">
             <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xs font-black text-primary-foreground shadow-sm">
               SA
             </div>
             <div className="flex-1 overflow-hidden">
                <div className="text-sm font-bold text-foreground truncate">Super Admin</div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Root Access</div>
             </div>
          </div>
          <button 
            onClick={() => adminLogoutAction()}
            className="flex items-center gap-3 w-full px-4 py-3 text-xs font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            Logout System
          </button>
        </div>
      </div>
    </>
  );
}
