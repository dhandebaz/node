
"use client";

export const dynamic = 'force-dynamic';


import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { 
  getSpaceStatsAction, 
  getSpaceConfigAction, 
  getAllSpaceServicesAction, 
  getSpaceAuditLogsAction 
} from "@/app/actions/space";
import { SpaceOverview } from "@/components/admin/space/SpaceOverview";
import { SpacePlanGovernance } from "@/components/admin/space/SpacePlanGovernance";
import { SpaceUserList } from "@/components/admin/space/SpaceUserList";
import { SpaceAuditLogView } from "@/components/admin/space/SpaceAuditLog";

export default function SpaceAdminPage() {
  const [data, setData] = useState<{
    stats: Awaited<ReturnType<typeof getSpaceStatsAction>>;
    config: Awaited<ReturnType<typeof getSpaceConfigAction>>;
    services: Awaited<ReturnType<typeof getAllSpaceServicesAction>>;
    logs: Awaited<ReturnType<typeof getSpaceAuditLogsAction>>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSpaceStatsAction(),
      getSpaceConfigAction(),
      getAllSpaceServicesAction(),
      getSpaceAuditLogsAction()
    ]).then(([stats, config, services, logs]) => {
      setData({ stats, config, services, logs });
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

  const { stats, config, services, logs } = data;

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Nodebase Space Management</h1>
        <p className="text-zinc-400">
          Infrastructure governance for hosting, compute, and CDN services.
        </p>
      </div>

      <SpaceOverview stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <SpaceUserList services={services} />
            <SpacePlanGovernance config={config} />
        </div>
        <div>
            <SpaceAuditLogView logs={logs} />
        </div>
      </div>
    </div>
  );
}
