"use client";

import { useState } from "react";
import { SystemFlagKey } from "@/lib/services/controlService";
import { toggleSystemFlagAction } from "@/app/actions/admin";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Power, UserPlus, CreditCard, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LaunchControlsProps {
  flags: Record<string, boolean>;
}

export function LaunchControls({ flags: initialFlags }: LaunchControlsProps) {
  const [flags, setFlags] = useState(initialFlags);
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (key: SystemFlagKey, currentValue: boolean) => {
    try {
      setLoading(key);
      // Optimistic update
      setFlags(prev => ({ ...prev, [key]: !currentValue }));
      
      await toggleSystemFlagAction(key, !currentValue);
      toast.success(`Flag ${key} updated successfully`);
    } catch (error) {
      // Revert on error
      setFlags(prev => ({ ...prev, [key]: currentValue }));
      toast.error("Failed to update flag");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const ControlCard = ({ 
    flagKey, 
    label, 
    description, 
    icon: Icon, 
    danger = false 
  }: { 
    flagKey: SystemFlagKey, 
    label: string, 
    description: string, 
    icon: any, 
    danger?: boolean 
  }) => {
    const isEnabled = flags[flagKey];
    
    return (
      <div className={cn(
        "p-6 rounded-2xl border transition-all duration-300",
        danger && isEnabled 
          ? "bg-destructive/10 border-destructive/30 shadow-lg shadow-destructive/10 scale-[1.02]" 
          : "bg-card border-border hover:border-primary/50 shadow-sm"
      )}>
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-colors",
              danger 
                ? "bg-destructive/10 text-destructive border-destructive/20" 
                : "bg-primary/10 text-primary border-primary/20"
            )}>
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-black text-foreground text-sm uppercase tracking-widest">
                  {label}
                </h3>
                {isEnabled ? (
                  <span className={cn(
                    "text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest",
                    danger ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
                  )}>
                    {danger ? "LIVE" : "ACTIVE"}
                  </span>
                ) : (
                  <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-muted text-muted-foreground tracking-widest">
                    OFFLINE
                  </span>
                )}
              </div>
              <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-tight">{description}</p>
            </div>
          </div>
        
          <Switch 
            checked={isEnabled}
            onCheckedChange={() => handleToggle(flagKey, isEnabled)}
            disabled={loading === flagKey}
            className={cn(
              "transition-all",
              danger ? "data-[state=checked]:bg-destructive" : "data-[state=checked]:bg-primary"
            )}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Global Kill Switches */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-8 mb-12">
        <h2 className="text-[10px] font-black text-destructive uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5" />
          Critical Security Overrides
        </h2>
        <div className="grid gap-6">
          <ControlCard 
            flagKey="incident_mode_enabled"
            label="Infiltration Lockdown"
            description="Emergency isolation: Suspends all AI processing and financial throughput."
            icon={AlertTriangle}
            danger={true}
          />
        </div>
      </div>

      {/* Feature Gates */}
      <div>
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6 flex items-center gap-3 ml-2">
          <Power className="w-5 h-5 text-primary" />
          Platform Feature Orchestration
        </h2>
        <div className="grid gap-6">
            <ControlCard 
              flagKey="ai_global_enabled"
              label="Core AI Synthesizer"
              description="Master authorization for all autonomous agent processing."
              icon={CheckCircle2}
            />
            <ControlCard 
              flagKey="signups_global_enabled"
              label="Gateway Access"
              description="Manages system entry for new user registrations."
              icon={UserPlus}
            />
            <ControlCard 
              flagKey="payments_global_enabled"
              label="Fiscal Processing"
              description="Authorize all wallet settlements and financial transfers."
              icon={CreditCard}
            />
          </div>
        </div>
      </div>
    );
  }
