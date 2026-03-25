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
  ShieldCheck,
  Loader2
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
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Core <span className="text-primary/40">Infrastructure</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Global architectural status & emergency containment systems
          </p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 px-6 py-4 rounded-2xl border border-border shadow-inner">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Systems Nominal</span>
        </div>
      </div>

      {/* Incident Mode Banner (Admin View) */}
      <div className={cn(
        "p-10 rounded-3xl border-2 flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-300 shadow-lg relative overflow-hidden group",
        flags['incident_mode_enabled'] 
          ? "bg-destructive/10 border-destructive shadow-destructive/20 animate-pulse" 
          : "bg-surface border-border shadow-inner"
      )}>
        {flags['incident_mode_enabled'] && <div className="absolute inset-0 bg-destructive/5 animate-pulse" />}
        <div className="flex items-center gap-6 relative z-10">
          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner transition-all",
            flags['incident_mode_enabled'] ? "bg-destructive text-destructive-foreground rotate-12" : "bg-muted text-muted-foreground"
          )}>
            <AlertOctagon className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">Incident Containment</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {flags['incident_mode_enabled'] 
                ? "CRITICAL: ARCHITECTURAL LOCKDOWN ACTIVE" 
                : "Operational status: Unrestricted"}
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleFlag('incident_mode_enabled', flags['incident_mode_enabled'])}
          disabled={!!toggling}
          className={cn(
            "w-full md:w-auto px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl active:scale-95 disabled:opacity-50 relative z-10",
            flags['incident_mode_enabled']
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/40"
              : "bg-foreground text-background hover:bg-foreground/90"
          )}
        >
          {toggling === 'incident_mode_enabled' ? "EXECUTING..." : flags['incident_mode_enabled'] ? "DEACTIVATE_PROTOCOL" : "INITIATE_CONTAINMENT"}
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
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-8 flex items-center gap-3 ml-2">
          <Power className="w-5 h-5 text-primary" />
          Architectural Kill Switches
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
    <div className="bg-card rounded-3xl p-6 border border-border shadow-sm group hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner transition-colors",
          isHealthy ? "bg-success/5 text-success/40 group-hover:bg-success/10 group-hover:text-success border-success/10" :
          isDegraded ? "bg-warning/5 text-warning/40 group-hover:bg-warning/10 group-hover:text-warning border-warning/10" :
          "bg-destructive/5 text-destructive/40 group-hover:bg-destructive/10 group-hover:text-destructive border-destructive/10"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {isHealthy ? (
          <CheckCircle className="w-4 h-4 text-success/20 group-hover:text-success transition-colors" />
        ) : isDegraded ? (
          <AlertTriangle className="w-4 h-4 text-warning/20 group-hover:text-warning transition-colors" />
        ) : (
          <XCircle className="w-4 h-4 text-destructive/20 group-hover:text-destructive transition-colors" />
        )}
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-foreground transition-colors">{title}</h4>
          <div className={cn(
            "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border w-fit mt-1.5",
            isHealthy ? "bg-success/10 text-success border-success/20" : 
            isDegraded ? "bg-warning/10 text-warning border-warning/20" : 
            "bg-destructive/10 text-destructive border-destructive/20"
          )}>
            {health.status.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border border-dashed">
          <div className="text-[9px] text-muted-foreground/30 font-mono italic">
            {new Date(health.last_checked).toLocaleTimeString()}
          </div>
          {health.latency && (
            <div className="text-[9px] text-muted-foreground/50 font-black font-mono bg-muted px-1.5 py-0.5 rounded">
              {health.latency}MS
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KillSwitch({ label, description, flagKey, enabled, onToggle, toggling }: any) {
  return (
    <div className={cn(
      "p-8 rounded-3xl border transition-all shadow-sm group relative overflow-hidden",
      enabled ? "bg-card border-border hover:border-primary/40 shadow-inner" : "bg-destructive/5 border-destructive/20 shadow-lg shadow-destructive/5"
    )}>
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h4 className="font-black text-xs uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
              {label}
            </h4>
            {!enabled && <span className="text-[8px] bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-black uppercase tracking-[0.2em]">Off_Protocol</span>}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/50 leading-relaxed max-w-[240px]">{description}</p>
        </div>
        <button
          onClick={onToggle}
          disabled={toggling}
          className={cn(
            "w-12 h-6 rounded-full relative transition-all duration-500 shadow-inner",
            enabled ? "bg-success/20" : "bg-destructive/20"
          )}
        >
          <div className={cn(
            "absolute top-1 w-4 h-4 rounded-full transition-all duration-500 shadow-lg",
            enabled ? "left-7 bg-success shadow-success/40" : "left-1 bg-destructive shadow-destructive/40"
          )} />
        </button>
      </div>
      <div className="mt-8 pt-4 border-t border-border border-dashed flex items-center justify-between relative z-10">
        <div className="text-[9px] font-mono text-muted-foreground/20 font-black uppercase tracking-widest">
          ID: {flagKey}
        </div>
        {toggling && <Loader2 className="w-3 h-3 animate-spin text-primary/40" />}
      </div>
    </div>
  );
}
