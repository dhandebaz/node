"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Server, 
  Bot, 
  Cloud, 
  Database, 
  FileText, 
  Settings, 
  ShieldAlert,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminLogoutAction } from "@/app/actions/auth";

const navItems = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Data Centers", href: "/admin/datacenters", icon: Server },
  { name: "kaisa AI", href: "/admin/kaisa", icon: Bot },
  { name: "Space", href: "/admin/space", icon: Cloud },
  { name: "Nodes", href: "/admin/nodes", icon: Database },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Audit Logs", href: "/admin/logs", icon: ShieldAlert },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-4 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white tracking-tight">NODEBASE <span className="text-xs font-mono text-zinc-500 block">CONTROL PLANE</span></h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-zinc-800 text-white" 
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <form action={adminLogoutAction}>
          <button 
            type="submit"
            className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-md transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
