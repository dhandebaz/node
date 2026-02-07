"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminLogoutAction } from "@/app/actions/auth";
import { 
  LayoutDashboard, 
  Users, 
  Server, 
  Cpu, 
  Database, 
  FileText, 
  Settings, 
  Activity,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Data Centers", href: "/admin/datacenters", icon: Server },
  { name: "Nodebase Core", href: "/admin/kaisa", icon: Cpu },
  { name: "Space", href: "/admin/space", icon: Database },
  { name: "Nodes", href: "/admin/nodes", icon: Server },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Audit Logs", href: "/admin/logs", icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
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
        "fixed md:sticky top-0 left-0 h-screen w-72 bg-[#0F0F11] border-r border-white/10 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div>
             <h1 className="text-xl font-bold uppercase tracking-tighter text-white">Nodebase</h1>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-red)] block mt-1">Admin Console</span>
          </div>
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
                        ? "bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)]" 
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-[var(--color-brand-red)]" : "opacity-70")} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0A0A0B]">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
               SA
             </div>
             <div className="flex-1 overflow-hidden">
               <div className="text-sm font-bold text-white truncate">Super Admin</div>
               <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Root Access</div>
             </div>
          </div>
          <button 
            onClick={() => adminLogoutAction()}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
