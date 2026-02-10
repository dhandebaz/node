"use client";

import { useState } from "react";
import { SystemFlagKey } from "@/lib/services/controlService";
import { toggleSystemFlagAction } from "@/app/actions/admin";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Power, UserPlus, CreditCard, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

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
      <div className={`p-6 rounded-xl border ${
        danger && isEnabled 
          ? "bg-red-500/10 border-red-500/30" 
          : "bg-white/5 border-white/10"
      } flex items-center justify-between`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            danger 
              ? "bg-red-500/20 text-red-400" 
              : "bg-brand-red/20 text-brand-red"
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              {label}
              {isEnabled ? (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  danger ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                }`}>
                  {danger ? "ACTIVE" : "ENABLED"}
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {danger ? "INACTIVE" : "DISABLED"}
                </span>
              )}
            </h3>
            <p className="text-white/60 text-sm mt-1">{description}</p>
          </div>
        </div>
        
        <Switch 
          checked={isEnabled}
          onCheckedChange={() => handleToggle(flagKey, isEnabled)}
          disabled={loading === flagKey}
          className={danger ? "data-[state=checked]:bg-red-500" : ""}
        />
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Global Kill Switches */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          Emergency Controls
        </h2>
        <div className="grid gap-4">
          <ControlCard 
            flagKey="incident_mode_enabled"
            label="Incident Mode"
            description="Pauses ALL high-risk actions (AI, Payments, Bookings) instantly."
            icon={AlertTriangle}
            danger={true}
          />
        </div>
      </div>

      {/* Feature Gates */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Power className="w-5 h-5 text-blue-500" />
          Feature Gates
        </h2>
        <div className="grid gap-4">
          <ControlCard 
            flagKey="ai_global_enabled"
            label="AI Engine"
            description="Master switch for all AI replies and actions."
            icon={CheckCircle2}
          />
          <ControlCard 
            flagKey="signups_global_enabled"
            label="New Signups"
            description="Allow new users to register."
            icon={UserPlus}
          />
          <ControlCard 
            flagKey="payments_global_enabled"
            label="Payments & Wallet"
            description="Enable wallet top-ups and transactions."
            icon={CreditCard}
          />
        </div>
      </div>
    </div>
  );
}
