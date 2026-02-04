
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Server, 
  Database, 
  FileText, 
  FileCheck, 
  User, 
  HelpCircle,
  LogOut
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/node/dashboard/overview", icon: LayoutDashboard },
  { label: "My Nodes", href: "/node/dashboard/nodes", icon: Server },
  { label: "Data Centers", href: "/node/dashboard/datacenters", icon: Database },
  { label: "Reports", href: "/node/dashboard/reports", icon: FileText },
  { label: "Documents", href: "/node/dashboard/documents", icon: FileCheck },
  { label: "Profile", href: "/node/dashboard/profile", icon: User },
  { label: "Support", href: "/node/dashboard/support", icon: HelpCircle },
];

export function InvestorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-xl">N</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Nodebase</h1>
            <span className="text-xs text-zinc-500 font-medium">INVESTOR PORTAL</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-zinc-900 text-white border border-zinc-800" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-500"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2 text-zinc-400">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
             <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Rahul Sharma</p>
            <p className="text-xs text-zinc-500 truncate">Node Investor</p>
          </div>
        </div>
        <button className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors">
          <LogOut className="w-3 h-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
