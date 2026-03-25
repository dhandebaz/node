import { ControlService } from "@/lib/services/controlService";
import { LaunchControls } from "@/components/admin/launch/LaunchControls";
import { Rocket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLaunchPage() {
  const flags = await ControlService.getSystemFlags();

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Rocket className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Mission <span className="text-primary/40">Control</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Global infrastructure availability & emergency containment systems
          </p>
        </div>
        <div className="flex items-center gap-3 bg-destructive/5 px-6 py-4 rounded-2xl border border-destructive/20 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-destructive animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive">Ready for Command</span>
        </div>
      </div>

      <LaunchControls flags={flags} />
    </div>
  );
}
