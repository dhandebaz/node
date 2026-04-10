"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getOmniAdminData } from "@/app/actions/admin-data";
import { OmniOverview } from "@/components/admin/omni/OmniOverview";
import { CapabilitiesControl } from "@/components/admin/omni/CapabilitiesControl";
import { RoleGovernance } from "@/components/admin/omni/RoleGovernance";
import { EmergencyControls } from "@/components/admin/omni/EmergencyControls";
import { IntegrationStatus } from "@/components/admin/omni/IntegrationStatus";
import { OmniUserList } from "@/components/admin/omni/OmniUserList";
import { OmniAuditLog } from "@/components/admin/omni/OmniAuditLog";

export default function OmniAdminPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getOmniAdminData>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOmniAdminData().then((res: any) => {
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

  const { config, stats, omniUsers, logs } = data;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Omni AI Core Governance</h1>
          <p className="text-zinc-400 font-medium italic">Executive orchestrator configuration and access control.</p>
        </div>
      </div>

      {/* Emergency Global Status */}
      <EmergencyControls status={config.systemStatus} />

      {/* High Level Metrics */}
      <OmniOverview stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Configuration Controls */}
        <div className="lg:col-span-2 space-y-8">
            <CapabilitiesControl modules={config.modules} />
            <OmniUserList users={omniUsers} />
        </div>

        {/* Right: Governance & Integrations */}
        <div className="space-y-8">
            <RoleGovernance roles={config.roles} />
            <IntegrationStatus integrations={config.integrations} />
            <OmniAuditLog logs={logs} />
        </div>
      </div>
    </div>
  );
}
