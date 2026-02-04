import { Users, Server, Zap, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-zinc-400">System status and key metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value="1,248" change="+12%" icon={Users} />
        <StatCard title="Active Nodes" value="48" change="+2" icon={Server} />
        <StatCard title="System Load" value="34%" change="-2%" icon={Zap} />
        <StatCard title="Active Alerts" value="3" change="0" icon={AlertTriangle} isAlert />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-blue" />
                <span className="text-zinc-300 text-sm">User updated profile settings</span>
              </div>
              <span className="text-zinc-500 text-xs">2 mins ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, isAlert }: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-400 text-sm font-medium">{title}</span>
        <Icon className={`w-4 h-4 ${isAlert ? "text-red-500" : "text-zinc-500"}`} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className={`text-xs mt-1 ${change.startsWith("+") ? "text-green-500" : "text-zinc-500"}`}>
        {change} from last week
      </div>
    </div>
  );
}
