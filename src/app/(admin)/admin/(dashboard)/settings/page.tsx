
"use client";

export const dynamic = 'force-dynamic';


import { useEffect, useState } from "react";
import { Loader2, Settings } from "lucide-react";
import { getAppSettingsAction, getSettingsAuditLogsAction } from "@/app/actions/settings";
import { AuthSettingsPanel } from "@/components/admin/settings/AuthSettings";
import { IntegrationSettingsPanel } from "@/components/admin/settings/IntegrationSettings";
import { FeatureFlagSettings } from "@/components/admin/settings/FeatureFlagSettings";
import { NotificationSettingsPanel } from "@/components/admin/settings/NotificationSettings";
import { SecuritySettingsPanel } from "@/components/admin/settings/SecuritySettings";
import { ApiSettingsPanel } from "@/components/admin/settings/ApiSettings";
import { SettingsAuditLogView } from "@/components/admin/settings/SettingsAuditLog";

export default function AppSettingsPage() {
  const [data, setData] = useState<{
    settings: Awaited<ReturnType<typeof getAppSettingsAction>>;
    logs: Awaited<ReturnType<typeof getSettingsAuditLogsAction>>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAppSettingsAction(),
      getSettingsAuditLogsAction()
    ]).then(([settings, logs]) => {
      setData({ settings, logs });
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { settings, logs } = data;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Core <span className="text-primary/40">Configuration</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Global platform orchestration & security protocols
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <AuthSettingsPanel settings={settings.auth} />
          {/* Removed EnvironmentSettingsPanel as it contained mock switches */}
          <SecuritySettingsPanel settings={settings.security} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <FeatureFlagSettings features={settings.features} />
          <ApiSettingsPanel settings={settings.api} />
          <IntegrationSettingsPanel integrations={settings.integrations} />
          <NotificationSettingsPanel settings={settings.notifications} />
        </div>
      </div>

      {/* Full Width Bottom */}
      <div className="pt-10 border-t border-border mt-12">
        <div className="mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Configuration Audit Ledger</h3>
        </div>
        <SettingsAuditLogView logs={logs} />
      </div>
    </div>
  );
}
