"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminLogoutAction } from "@/app/actions/auth";

const navItems = [
  { name: "Overview", href: "/admin/dashboard" },
  { name: "Users", href: "/admin/users" },
  { name: "Data Centers", href: "/admin/datacenters" },
  { name: "Nodebase Core", href: "/admin/kaisa" },
  { name: "Space", href: "/admin/space" },
  { name: "Nodes", href: "/admin/nodes" },
  { name: "Content", href: "/admin/content" },
  { name: "Settings", href: "/admin/settings" },
  { name: "Audit Logs", href: "/admin/logs" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-[var(--color-brand-red)] border-r border-white/20 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="h-20 flex items-center px-6 border-b border-white/20">
        <div>
           <h1 className="text-xl font-bold uppercase tracking-tighter text-white">Nodebase</h1>
           <span className="text-xs font-bold uppercase tracking-widest text-white/50 block mt-1">Control Plane</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <ul className="space-y-1 px-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block py-2 text-sm font-bold uppercase tracking-wider transition-opacity",
                    isActive 
                      ? "opacity-100 pl-3 border-l-2 border-white" 
                      : "opacity-60 hover:opacity-100 pl-3 border-l-2 border-transparent"
                  )}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 border-t border-white/20">
        <button 
          onClick={() => adminLogoutAction()}
          className="block w-full text-left text-sm font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
