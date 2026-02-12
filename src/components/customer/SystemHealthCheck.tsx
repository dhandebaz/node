"use client";

import { AlertTriangle, WifiOff, CreditCard, PowerOff } from "lucide-react";
import Link from "next/link";
import { Tenant, ListingIntegration } from "@/types";

interface SystemHealthCheckProps {
  flags: Record<string, boolean>;
  walletBalance: number;
  tenant: Tenant;
  integrations: ListingIntegration[];
}

export function SystemHealthCheck({ flags, walletBalance, tenant, integrations }: SystemHealthCheckProps) {
  const alerts = [];

  // 1. Check Global AI Status
  if (flags['ai_global_enabled'] === false) {
    alerts.push({
      type: 'critical',
      icon: PowerOff,
      title: "AI Engine is Globally Paused",
      message: "We are performing critical maintenance. AI replies are temporarily suspended. No credits will be deducted.",
      action: null
    });
  }

  // 2. Check Tenant AI Status
  if (tenant.is_ai_enabled === false && flags['ai_global_enabled'] !== false) {
    alerts.push({
      type: 'warning',
      icon: PowerOff,
      title: "Your AI Employee is Paused",
      message: "You have manually paused your AI. It will not reply to guests.",
      action: { label: "Resume AI", href: "/dashboard/ai/settings" }
    });
  }

  // 3. Check Wallet Balance
  if (walletBalance < 100) {
    alerts.push({
      type: 'critical',
      icon: CreditCard,
      title: "Low Wallet Balance",
      message: `You have ${walletBalance} credits left. AI actions may stop soon.`,
      action: { label: "Add Credits", href: "/dashboard/billing" }
    });
  }

  // 4. Check Integrations
  const failedIntegrations = integrations.filter(i => i.status === 'error');
  if (failedIntegrations.length > 0) {
    alerts.push({
      type: 'warning',
      icon: WifiOff,
      title: `${failedIntegrations.length} Integration(s) Disconnected`,
      message: "Some listings are not syncing correctly. Please reconnect them.",
      action: { label: "Fix Integrations", href: "/dashboard/ai/integrations" }
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="grid gap-4 mb-8">
      {alerts.map((alert, i) => (
        <div 
          key={i} 
          className={`p-4 rounded-xl border flex items-start gap-4 ${
            alert.type === 'critical' 
              ? "bg-red-500/10 border-red-500/30 text-red-200" 
              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-200"
          }`}
        >
          <div className={`p-2 rounded-lg ${
            alert.type === 'critical' ? "bg-red-500/20" : "bg-yellow-500/20"
          }`}>
            <alert.icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-1">{alert.title}</h3>
            <p className="text-sm opacity-80 mb-3">{alert.message}</p>
            {alert.action && (
              <Link 
                href={alert.action.href}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors inline-block ${
                  alert.type === 'critical' 
                    ? "bg-red-500 text-white hover:bg-red-600" 
                    : "bg-yellow-500 text-black hover:bg-yellow-400"
                }`}
              >
                {alert.action.label}
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
