
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-zinc-400" />
            App Settings
          </h1>
          <p className="text-zinc-400 mt-1">Centralized platform configuration and control.</p>
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
      <div className="pt-6 border-t border-zinc-800">
        <SettingsAuditLogView logs={logs} />
      </div>
    </div>
  );
}
