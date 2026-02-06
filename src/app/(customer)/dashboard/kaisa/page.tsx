export const dynamic = 'force-dynamic';


import { getKaisaDashboardData } from "@/app/actions/customer";
import { 
  Briefcase, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Settings,
  Plus,
  ArrowRight,
  ExternalLink,
  Wallet
} from "lucide-react";
import Link from "next/link";

export default async function KaisaDashboardPage() {
  const data = await getKaisaDashboardData();
  const { identity, profile, credits, tasks, integrations } = data;

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Dashboard
          </h1>
          <p className="text-zinc-400">
            Overview for <span className="text-white font-medium">{profile.businessType}</span> business
          </p>
        </div>
        <Link href="/dashboard/kaisa/settings" className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-zinc-400" />
        </Link>
      </div>

      {/* Stats & Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-saffron/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-75" />
          
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800 rounded-lg text-brand-saffron">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-zinc-200">Wage Balance</h3>
             </div>
             <button className="text-xs bg-white text-black hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors font-medium">
                Top Up
             </button>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">₹{credits.balance}</span>
            <span className="text-sm text-zinc-500 font-medium">available</span>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
               <div 
                 className="bg-brand-saffron h-full rounded-full" 
                 style={{ width: `${(credits.balance / credits.monthlyLimit) * 100}%` }}
               />
            </div>
            <span>{Math.round((credits.balance / credits.monthlyLimit) * 100)}%</span>
          </div>
        </div>

        {/* Business Status Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800 rounded-lg text-blue-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-zinc-200">Status</h3>
             </div>
             <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                profile.status === "active" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
             }`}>
                {profile.status}
             </div>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Plan</span>
                <span className="text-white capitalize">{profile.role}</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Active Modules</span>
                <span className="text-white">{profile.activeModules.length}</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Pending Actions</span>
                <span className="text-white">{tasks.filter(t => t.status === "in_progress").length}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Connected Apps</h2>
            <Link href="/dashboard/kaisa/modules" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrations.filter(i => i.enabledGlobal).map((integration) => (
                <div key={integration.name} className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-xl p-4 flex flex-col justify-between h-32">
                    <div className="flex items-start justify-between">
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-lg font-bold text-zinc-400">
                            {integration.name[0]}
                        </div>
                        {/* Mock Status Logic: 'Messaging' is connected, others not */}
                        {integration.name === "Messaging" ? (
                             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        ) : (
                             <div className="w-2 h-2 rounded-full bg-zinc-700" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-white font-medium text-sm">{integration.name}</h3>
                        {integration.name === "Messaging" ? (
                             <span className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
                                Connected
                             </span>
                        ) : (
                             <button className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1">
                                Login <ExternalLink className="w-2 h-2" />
                             </button>
                        )}
                    </div>
                </div>
            ))}
             <button className="bg-zinc-900/30 border border-zinc-800 border-dashed hover:border-zinc-700 hover:bg-zinc-900/50 transition-all rounded-xl p-4 flex flex-col items-center justify-center h-32 gap-2 group">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                    <Plus className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-xs text-zinc-500 font-medium">Add App</span>
             </button>
        </div>
      </div>
      
      {/* Quick Settings Banner */}
      <Link href="/dashboard/kaisa/settings" className="block bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-800 rounded-full">
                    <Settings className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                    <h3 className="text-white font-medium">Settings & Billing</h3>
                    <p className="text-sm text-zinc-500">Manage plan, cards, and payment QR codes</p>
                </div>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-500" />
        </div>
      </Link>
    </div>
  );
}
