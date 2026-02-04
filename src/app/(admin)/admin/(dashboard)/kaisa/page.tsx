
import { kaisaService } from "@/lib/services/kaisaService";
import { userService } from "@/lib/services/userService";
import { KaisaOverview } from "@/components/admin/kaisa/KaisaOverview";
import { CapabilitiesControl } from "@/components/admin/kaisa/CapabilitiesControl";
import { RoleGovernance } from "@/components/admin/kaisa/RoleGovernance";
import { EmergencyControls } from "@/components/admin/kaisa/EmergencyControls";
import { IntegrationStatus } from "@/components/admin/kaisa/IntegrationStatus";
import { KaisaUserList } from "@/components/admin/kaisa/KaisaUserList";
import { KaisaAuditLog } from "@/components/admin/kaisa/KaisaAuditLog";

export default async function KaisaAdminPage() {
  const config = await kaisaService.getConfig();
  const stats = await kaisaService.getStats();
  const allUsers = await userService.getUsers();
  const logs = await kaisaService.getAuditLogs();
  
  // Filter for kaisa users only
  const kaisaUsers = allUsers.filter(u => u.roles.isKaisaUser);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">kaisa AI Governance</h1>
          <p className="text-zinc-400">Agentic manager configuration and access control.</p>
        </div>
      </div>

      {/* Emergency Global Status */}
      <EmergencyControls status={config.systemStatus} />

      {/* High Level Metrics */}
      <KaisaOverview stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Configuration Controls */}
        <div className="lg:col-span-2 space-y-8">
            <CapabilitiesControl modules={config.modules} />
            <KaisaUserList users={kaisaUsers} />
        </div>

        {/* Right: Governance & Integrations */}
        <div className="space-y-8">
            <RoleGovernance roles={config.roles} />
            <IntegrationStatus integrations={config.integrations} />
            <KaisaAuditLog logs={logs} />
        </div>
      </div>

    </div>
  );
}
