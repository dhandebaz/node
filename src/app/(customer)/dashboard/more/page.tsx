"use client";

import Link from "next/link";
import { 
  User, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Building,
  Plug,
  ShieldCheck,
  LayoutGrid
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { useAuthStore } from "@/store/useAuthStore";

export default function MorePage() {
  const { host } = useAuthStore();
  
  const menuItems = [
    {
      section: "Account",
      items: [
        { icon: User, label: "Profile", href: "/dashboard/settings" }, 
        { icon: ShieldCheck, label: "KYC Status", href: "/node/apply/kyc" },
      ]
    },
    {
      section: "Business",
      items: [
        { icon: LayoutGrid, label: "Listings", href: "/dashboard/kaisa/listings" }, 
        { icon: Plug, label: "Integrations", href: "/dashboard/integrations" },
        { icon: CreditCard, label: "Billing & Invoices", href: "/dashboard/billing" },
      ]
    },
    {
      section: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", href: "/dashboard/support" },
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      
      {/* User Header */}
      <div className="flex items-center gap-4 p-4 bg-[#2A0A0A] border border-white/10 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-[var(--color-brand-red)] border-2 border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-lg">
           {host?.name ? host.name.charAt(0) : 'U'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{host?.name || "Guest User"}</h1>
          <p className="text-white/60 text-sm">{host?.email || "No email linked"}</p>
          <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20 uppercase tracking-wider">
            Verified Host
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest px-2 mb-2">
              {section.section}
            </h2>
            <div className="bg-[#2A0A0A] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
              {section.items.map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between p-4 active:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-lg text-white/70 group-hover:text-white group-hover:bg-white/10 transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-white">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div>
          <button 
            onClick={() => logoutAction()}
            className="w-full flex items-center justify-between p-4 bg-[#2A0A0A] border border-red-500/20 rounded-2xl active:bg-red-500/10 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500/20 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium text-red-400">Log Out</span>
            </div>
          </button>
          <p className="text-center text-[10px] text-white/20 mt-6">
            Nodebase Mobile v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
