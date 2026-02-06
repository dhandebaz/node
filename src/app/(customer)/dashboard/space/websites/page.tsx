export const dynamic = 'force-dynamic';


import { getSpaceDashboardData, getSpaceProjectDetails } from "@/app/actions/customer";
import { 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Settings,
  MoreVertical,
  Terminal
} from "lucide-react";
import Link from "next/link";

export default async function SpaceWebsitesPage() {
  const data = await getSpaceDashboardData();
  const { projects } = data;

  // In a real app, we'd fetch details for expanded view
  // For now, we show list

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Websites</h1>
          <p className="text-zinc-400">Manage your deployed applications and domains.</p>
        </div>
        <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors">
            + New Project
        </button>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-start justify-between bg-black/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Link href={`/dashboard/space/websites/${project.id}`} className="hover:text-purple-400 transition-colors">
                        {project.domain}
                    </Link>
                    <a href={`https://${project.domain}`} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                    <span className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${project.status === "active" ? "bg-green-500" : "bg-amber-500"}`} />
                        {project.status === "active" ? "Live" : project.status}
                    </span>
                    <span>•</span>
                    <span className="uppercase">{project.type}</span>
                  </div>
                </div>
              </div>
              
              <Link href={`/dashboard/space/websites/${project.id}`} className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
            </div>

            {/* Quick Actions / Stats */}
            <div className="p-6 grid md:grid-cols-4 gap-6">
                <div className="space-y-1">
                    <div className="text-xs uppercase font-bold text-zinc-600 tracking-wider">Security</div>
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                        <ShieldCheck className="w-4 h-4" /> SSL Active
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="text-xs uppercase font-bold text-zinc-600 tracking-wider">Last Backup</div>
                    <div className="flex items-center gap-2 text-zinc-300 text-sm">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        {project.lastBackup ? new Date(project.lastBackup).toLocaleDateString() : "Never"}
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="text-xs uppercase font-bold text-zinc-600 tracking-wider">Environment</div>
                    <div className="flex items-center gap-2 text-zinc-300 text-sm">
                        <Terminal className="w-4 h-4 text-zinc-500" />
                        Production
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 rounded border border-zinc-700 hover:border-zinc-600 transition-colors">
                        Logs
                    </button>
                    <Link href={`/dashboard/space/websites/${project.id}`} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 rounded border border-zinc-700 hover:border-zinc-600 transition-colors">
                        DNS
                    </Link>
                </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
            <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-xl border-dashed">
                <Globe className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-300">No websites yet</h3>
                <p className="text-zinc-500 max-w-sm mx-auto mt-2 mb-6">
                    Deploy your first project to Nodebase Space to get started with high-performance hosting.
                </p>
                <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors">
                    Create Project
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
