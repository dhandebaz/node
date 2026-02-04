
import { getKaisaDashboardData } from "@/app/actions/customer";
import { 
  Briefcase, 
  CreditCard, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  Clock
} from "lucide-react";

export default async function KaisaDashboardPage() {
  const data = await getKaisaDashboardData();
  const { identity, profile, activity, credits, tasks } = data;

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
            Hello, {identity?.email || "Manager"}
          </h1>
        <p className="text-zinc-400">
          Here is what kaisa is doing for your <span className="text-white font-medium">{profile.businessType}</span> business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Business Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-zinc-200">Business Status</h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full ${profile.status === "active" ? "bg-green-500" : "bg-amber-500"}`} />
            <span className="text-2xl font-bold text-white capitalize">{profile.status}</span>
          </div>
          <p className="text-sm text-zinc-500">
            {profile.role === "manager" ? "Standard Plan" : "Co-Founder Plan"} • {profile.activeModules.length} Modules Active
          </p>
        </div>

        {/* Credits */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-zinc-200">Available Credits</h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-white">{credits.balance}</span>
            <span className="text-sm text-zinc-500">/ {credits.monthlyLimit}</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full" 
              style={{ width: `${(credits.balance / credits.monthlyLimit) * 100}%` }}
            />
          </div>
          <p className="text-sm text-zinc-500 mt-2">
            {credits.usedThisMonth} used this month
          </p>
        </div>

        {/* Pending Tasks */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-zinc-200">Pending Actions</h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-white">
              {tasks.filter(t => t.status === "in_progress" || t.status === "pending").length}
            </span>
          </div>
          <p className="text-sm text-zinc-500">
            Tasks requiring attention or in progress.
          </p>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left: Recent Activity (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-zinc-400" />
            Recent Activity
          </h2>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-zinc-800">
              {activity.map((item) => (
                <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-zinc-800/50 transition-colors">
                  <div className={`mt-1 p-1.5 rounded-full ${
                    item.type === "system_action" ? "bg-blue-500/10 text-blue-500" :
                    item.type === "alert" ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-purple-500/10 text-purple-500"
                  }`}>
                    {item.type === "system_action" ? <CheckCircle className="w-4 h-4" /> : 
                     item.type === "alert" ? <AlertCircle className="w-4 h-4" /> :
                     <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {item.module}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {activity.length === 0 && (
                <div className="p-8 text-center text-zinc-500">No recent activity.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Modules (1 col) */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">Active Modules</h2>
          <div className="space-y-3">
            {profile.activeModules.map((mod) => (
              <div key={mod} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                <span className="font-medium text-zinc-300">{mod}</span>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Active</span>
                </div>
              </div>
            ))}
            {profile.activeModules.length === 0 && (
                <div className="text-zinc-500 text-sm">No active modules.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
