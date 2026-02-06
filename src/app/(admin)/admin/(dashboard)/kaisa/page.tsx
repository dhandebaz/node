"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getKaisaPageData } from "@/app/actions/admin-data";
import { KaisaOverview } from "@/components/admin/kaisa/KaisaOverview";
import { CapabilitiesControl } from "@/components/admin/kaisa/CapabilitiesControl";
import { RoleGovernance } from "@/components/admin/kaisa/RoleGovernance";
import { EmergencyControls } from "@/components/admin/kaisa/EmergencyControls";
import { IntegrationStatus } from "@/components/admin/kaisa/IntegrationStatus";
import { KaisaUserList } from "@/components/admin/kaisa/KaisaUserList";
import { KaisaAuditLog } from "@/components/admin/kaisa/KaisaAuditLog";

export default function KaisaAdminPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getKaisaPageData>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKaisaPageData().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
        </div>
    );
  }

  const { config, stats, kaisaUsers, logs } = data;

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
