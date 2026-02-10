export const dynamic = 'force-dynamic';


import { getKaisaDashboardData } from "@/app/actions/customer";
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Clock 
} from "lucide-react";

export default async function KaisaActivityPage() {
  const { activity } = await getKaisaDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-brand-headline)] mb-1">Activity Log</h1>
        <p className="text-[var(--color-brand-muted)]">Recent actions taken by your AI Employee and system events.</p>
      </div>

      <div className="glass-card border border-[var(--color-brand-node-line)] rounded-xl overflow-hidden">
        <div className="p-6 space-y-6">
          {activity.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="mt-1">
                {item.type === "system_action" && (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-brand-accent)]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-accent)]" />
                  </div>
                )}
                {item.type === "user_command" && (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-brand-body)]/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-[var(--color-brand-body)]" />
                  </div>
                )}
                {item.type === "alert" && (
                  <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[var(--color-brand-headline)] font-medium">{item.description}</p>
                    <p className="text-sm text-[var(--color-brand-muted)] mt-1">
                      Module: <span className="text-[var(--color-brand-body)]">{item.module}</span>
                    </p>
                  </div>
                  <div className="flex items-center text-[var(--color-brand-muted)] text-xs gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {activity.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-[var(--color-brand-muted)] mx-auto mb-4" />
              <p className="text-[var(--color-brand-muted)]">No recent activity recorded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
