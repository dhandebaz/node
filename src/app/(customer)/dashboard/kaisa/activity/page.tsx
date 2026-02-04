
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
        <h1 className="text-2xl font-bold text-white mb-1">Activity Log</h1>
        <p className="text-zinc-400">Recent actions taken by Kaisa and system events.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 space-y-6">
          {activity.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="mt-1">
                {item.type === "system_action" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  </div>
                )}
                {item.type === "user_command" && (
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
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
                    <p className="text-white font-medium">{item.description}</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      Module: <span className="text-zinc-400">{item.module}</span>
                    </p>
                  </div>
                  <div className="flex items-center text-zinc-500 text-xs gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {activity.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400">No recent activity recorded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
