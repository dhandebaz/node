export const dynamic = 'force-dynamic';


import { getSpaceProjectDetails } from "@/app/actions/customer";
import { 
  Globe, 
  Shield, 
  HardDrive, 
  Settings, 
  RefreshCw,
  Terminal,
  Database,
  Lock,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getSpaceProjectDetails(id);

  if (!data) {
    notFound();
  }

  const { project, dns } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link 
            href="/dashboard/space/websites"
            className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-4 transition-colors"
        >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Websites
        </Link>
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">{project.domain}</h1>
                <p className="text-zinc-400">Project ID: {project.id}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                project.status === "active" 
                ? "bg-green-500/10 text-green-400 border-green-500/20" 
                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
            }`}>
                {project.status.toUpperCase()}
            </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Control Panel */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-left group">
                    <RefreshCw className="w-5 h-5 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                    <div className="font-medium text-white text-sm">Deploy</div>
                </button>
                <button className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-left group">
                    <Terminal className="w-5 h-5 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                    <div className="font-medium text-white text-sm">Console</div>
                </button>
                <button className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-left group">
                    <Database className="w-5 h-5 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                    <div className="font-medium text-white text-sm">Backups</div>
                </button>
                <button className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-left group">
                    <Settings className="w-5 h-5 text-zinc-400 mb-3 group-hover:scale-110 transition-transform" />
                    <div className="font-medium text-white text-sm">Settings</div>
                </button>
            </div>

            {/* DNS Records */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-zinc-400" />
                        DNS Records
                    </h2>
                    <button className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded-md transition-colors">
                        Add Record
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-950 text-zinc-400 font-medium">
                            <tr>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Value</th>
                                <th className="px-6 py-3">TTL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-zinc-300">
                            {dns.map((record) => (
                                <tr key={record.id} className="hover:bg-zinc-800/50">
                                    <td className="px-6 py-3 font-mono text-xs">{record.type}</td>
                                    <td className="px-6 py-3">{record.name}</td>
                                    <td className="px-6 py-3 font-mono text-xs truncate max-w-[200px]">{record.value}</td>
                                    <td className="px-6 py-3">{record.ttl}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Environment Variables Mock */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                 <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-zinc-400" />
                        Environment Variables
                    </h2>
                    <button className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded-md transition-colors">
                        Reveal
                    </button>
                </div>
                <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-950 rounded border border-zinc-800">
                        <span className="font-mono text-xs text-blue-400">DATABASE_URL</span>
                        <span className="font-mono text-xs text-zinc-600">**************************</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-950 rounded border border-zinc-800">
                        <span className="font-mono text-xs text-blue-400">API_KEY</span>
                        <span className="font-mono text-xs text-zinc-600">**************************</span>
                    </div>
                </div>
            </div>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Details</h3>
                <div className="space-y-4">
                    <div>
                        <div className="text-xs text-zinc-500 mb-1">Created At</div>
                        <div className="text-sm text-white">{new Date(project.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div className="text-xs text-zinc-500 mb-1">Last Backup</div>
                        <div className="text-sm text-white">{project.lastBackup ? new Date(project.lastBackup).toLocaleString() : 'N/A'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-zinc-500 mb-1">SSL Status</div>
                        <div className="flex items-center gap-2 text-sm text-green-400">
                            <Shield className="w-3 h-3" />
                            Active (Auto-Renew)
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-zinc-500 mb-1">Plan</div>
                        <div className="text-sm text-white">Pro Cloud</div>
                    </div>
                </div>
            </div>

             <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-sm font-medium text-white mb-2">Need Help?</h3>
                <p className="text-sm text-zinc-400 mb-4">
                    Our AI assistant can help you configure DNS or troubleshoot deployment issues.
                </p>
                <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                    Ask Assistant
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
