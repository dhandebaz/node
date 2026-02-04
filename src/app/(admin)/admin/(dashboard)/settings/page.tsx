
import { getAppSettingsAction, getSettingsAuditLogsAction } from "@/app/actions/settings";
import { AuthSettingsPanel } from "@/components/admin/settings/AuthSettings";
import { IntegrationSettingsPanel } from "@/components/admin/settings/IntegrationSettings";
import { FeatureFlagSettings } from "@/components/admin/settings/FeatureFlagSettings";
import { EnvironmentSettingsPanel } from "@/components/admin/settings/EnvironmentSettings";
import { NotificationSettingsPanel } from "@/components/admin/settings/NotificationSettings";
import { SecuritySettingsPanel } from "@/components/admin/settings/SecuritySettings";
import { ApiSettingsPanel } from "@/components/admin/settings/ApiSettings";
import { SettingsAuditLogView } from "@/components/admin/settings/SettingsAuditLog";
import { Settings } from "lucide-react";

export const metadata = {
  title: "App Settings | Nodebase Admin",
};

export default async function AppSettingsPage() {
  const settings = await getAppSettingsAction();
  const logs = await getSettingsAuditLogsAction();

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
          <EnvironmentSettingsPanel settings={settings.platform} />
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
