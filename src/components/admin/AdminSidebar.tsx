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
  X
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";

const navItems = [
  { name: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { name: "AI Managers", href: "/admin/ai-managers", icon: Cpu },
  { name: "AI Rules", href: "/admin/ai-rules", icon: ShieldCheck },
  { name: "Pricing & Costs", href: "/admin/pricing", icon: DollarSign },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Usage & Wallets", href: "/admin/usage", icon: Wallet },
  { name: "Integrations Health", href: "/admin/integrations", icon: Plug },
  { name: "System Logs", href: "/admin/logs", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-[var(--color-brand-red)] border border-white/20 rounded-lg text-white shadow-lg"
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
        "fixed md:sticky top-0 left-0 h-screen w-72 bg-[var(--color-brand-red)] border-r border-white/20 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="h-20 flex items-center px-6 border-b border-white/20 shrink-0">
          <Link href="/" className="flex items-center gap-3">
             <Logo className="w-8 h-8 text-white" />
             <div>
                <h1 className="text-xl font-bold uppercase tracking-tighter text-white">Nodebase</h1>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 block mt-0.5">Admin Console</span>
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
                      "flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-all",
                      isActive 
                        ? "bg-white/10 text-white shadow-sm" 
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "opacity-70")} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/20 bg-black/10 shrink-0 pb-safe">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
               SA
             </div>
             <div className="flex-1 overflow-hidden">
               <div className="text-sm font-bold text-white truncate">Super Admin</div>
               <div className="text-[10px] text-white/50 uppercase tracking-wider">Root Access</div>
             </div>
          </div>
          <button 
            onClick={() => adminLogoutAction()}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold uppercase tracking-wider text-red-200 hover:bg-red-500/20 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
