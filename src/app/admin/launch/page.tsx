import { ControlService } from "@/lib/services/controlService";
import { LaunchControls } from "@/components/admin/launch/LaunchControls";
import { Rocket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLaunchPage() {
  const flags = await ControlService.getSystemFlags();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Rocket className="w-8 h-8 text-brand-red" />
          Launch Control Center
        </h1>
        <p className="text-zinc-400">
          Manage global availability and emergency kill switches for the platform.
        </p>
      </div>

      <LaunchControls flags={flags} />
    </div>
  );
}
