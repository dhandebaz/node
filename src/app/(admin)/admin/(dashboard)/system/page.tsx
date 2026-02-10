"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth, postWithAuth } from "@/lib/api/fetcher";
import { 
  Activity, 
  Power, 
  AlertOctagon, 
  Zap, 
  Database, 
  CreditCard, 
  MessageSquare,
  Globe,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemFlagKey } from "@/lib/services/controlService";

interface SystemStatus {
  auth: ServiceHealth;
  database: ServiceHealth;
  ai_service: ServiceHealth;
  payments: ServiceHealth;
  integrations: ServiceHealth;
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'down';
  last_checked: string;
  latency?: number;
}

export default function AdminSystemPage() {
  const [health, setHealth] = useState<SystemStatus | null>(null);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchWithAuth<{ health: SystemStatus; flags: Record<string, boolean> }>("/api/admin/system/dashboard");
      setHealth(data.health);
      setFlags(data.flags);
    } catch (err) {
      console.error("Failed to load system status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleFlag = async (key: string, currentValue: boolean) => {
    if (!confirm(`Are you sure you want to ${currentValue ? 'DISABLE' : 'ENABLE'} this feature globally? This will affect ALL tenants immediately.`)) {
      return;
    }

    setToggling(key);
    try {
      await postWithAuth("/api/admin/system/flags", { key, value: !currentValue });
      await loadData();
    } catch (err) {
      alert("Failed to update flag");
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <div>Loading system status...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">System Controls</h1>
        <p className="text-white/60">Monitor health and manage global kill switches.</p>
      </div>

      {/* Incident Mode Banner (Admin View) */}
      <div className={cn(
        "p-6 rounded-2xl border-2 flex items-center justify-between transition-colors",
        flags['incident_mode_enabled'] 
          ? "bg-red-500/20 border-red-500" 
          : "bg-white/5 border-white/10"
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-full",
            flags['incident_mode_enabled'] ? "bg-red-500 text-white" : "bg-white/10 text-white/60"
          )}>
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Incident Mode</h2>
            <p className="text-white/60">
              {flags['incident_mode_enabled'] 
                ? "ACTIVE: Users see warning banner, high-risk actions blocked." 
                : "Inactive: System operating normally."}
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleFlag('incident_mode_enabled', flags['incident_mode_enabled'])}
          disabled={!!toggling}
          className={cn(
            "px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-all",
            flags['incident_mode_enabled']
              ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          {toggling === 'incident_mode_enabled' ? "Updating..." : flags['incident_mode_enabled'] ? "Deactivate Incident Mode" : "Activate Incident Mode"}
        </button>
      </div>

      {/* Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <HealthCard 
          title="Auth Service" 
          icon={ShieldCheck} 
          health={health?.auth} 
        />
        <HealthCard 
          title="Database" 
          icon={Database} 
          health={health?.database} 
        />
        <HealthCard 
          title="AI Engine" 
          icon={Zap} 
          health={health?.ai_service} 
        />
        <HealthCard 
          title="Payments" 
          icon={CreditCard} 
          health={health?.payments} 
        />
        <HealthCard 
          title="Integrations" 
          icon={Globe} 
          health={health?.integrations} 
        />
      </div>

      {/* Global Kill Switches */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Power className="w-5 h-5 text-[var(--color-brand-red)]" />
          Global Kill Switches
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KillSwitch 
            label="AI Replies" 
            description="Globally disable all AI auto-replies."
            flagKey="ai_global_enabled"
            enabled={flags['ai_global_enabled']}
            onToggle={() => toggleFlag('ai_global_enabled', flags['ai_global_enabled'])}
            toggling={toggling === 'ai_global_enabled'}
          />
          <KillSwitch 
            label="Payment Links" 
            description="Prevent generation of new payment links."
            flagKey="payments_global_enabled"
            enabled={flags['payments_global_enabled']}
            onToggle={() => toggleFlag('payments_global_enabled', flags['payments_global_enabled'])}
            toggling={toggling === 'payments_global_enabled'}
          />
          <KillSwitch 
            label="New Bookings" 
            description="Stop new bookings from being created."
            flagKey="bookings_global_enabled"
            enabled={flags['bookings_global_enabled']}
            onToggle={() => toggleFlag('bookings_global_enabled', flags['bookings_global_enabled'])}
            toggling={toggling === 'bookings_global_enabled'}
          />
          <KillSwitch 
            label="Outbound Messaging" 
            description="Pause all outgoing messages (Human & AI)."
            flagKey="messaging_global_enabled"
            enabled={flags['messaging_global_enabled']}
            onToggle={() => toggleFlag('messaging_global_enabled', flags['messaging_global_enabled'])}
            toggling={toggling === 'messaging_global_enabled'}
          />
          <KillSwitch 
            label="Integrations Sync" 
            description="Halt calendar and message syncing."
            flagKey="sync_global_enabled"
            enabled={flags['sync_global_enabled']}
            onToggle={() => toggleFlag('sync_global_enabled', flags['sync_global_enabled'])}
            toggling={toggling === 'sync_global_enabled'}
          />
          <KillSwitch 
            label="New User Signups" 
            description="Prevent new users from creating accounts."
            flagKey="signups_global_enabled"
            enabled={flags['signups_global_enabled']}
            onToggle={() => toggleFlag('signups_global_enabled', flags['signups_global_enabled'])}
            toggling={toggling === 'signups_global_enabled'}
          />
        </div>
      </div>
    </div>
  );
}

function HealthCard({ title, icon: Icon, health }: { title: string; icon: any; health?: ServiceHealth }) {
  if (!health) return null;
  
  const isHealthy = health.status === 'healthy';
  const isDegraded = health.status === 'degraded';

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white/80">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-bold uppercase">{title}</span>
        </div>
        {isHealthy ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : isDegraded ? (
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400" />
        )}
      </div>
      <div className="flex items-end justify-between">
        <div className={cn(
          "text-xs font-mono px-2 py-0.5 rounded",
          isHealthy ? "bg-green-500/20 text-green-300" : 
          isDegraded ? "bg-amber-500/20 text-amber-300" : 
          "bg-red-500/20 text-red-300"
        )}>
          {health.status.toUpperCase()}
        </div>
        {health.latency && (
          <div className="text-xs text-white/40 font-mono">
            {health.latency}ms
          </div>
        )}
      </div>
      <div className="text-[10px] text-white/20 mt-2 font-mono">
        Last: {new Date(health.last_checked).toLocaleTimeString()}
      </div>
    </div>
  );
}

function KillSwitch({ label, description, flagKey, enabled, onToggle, toggling }: any) {
  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all",
      enabled ? "bg-white/5 border-white/10" : "bg-red-500/10 border-red-500/30"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-lg flex items-center gap-2">
            {label}
            {!enabled && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">Disabled</span>}
          </h4>
          <p className="text-sm text-white/60 mt-1">{description}</p>
        </div>
        <button
          onClick={onToggle}
          disabled={toggling}
          className={cn(
            "w-12 h-6 rounded-full relative transition-colors duration-200",
            enabled ? "bg-green-500/20" : "bg-red-500/20"
          )}
        >
          <div className={cn(
            "absolute top-1 w-4 h-4 rounded-full transition-transform duration-200",
            enabled ? "left-7 bg-green-400" : "left-1 bg-red-400"
          )} />
        </button>
      </div>
      <div className="mt-3 text-xs font-mono text-white/30">
        KEY: {flagKey}
      </div>
    </div>
  );
}
