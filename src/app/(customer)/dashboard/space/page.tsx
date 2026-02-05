
import { getSpaceDashboardData } from "@/app/actions/customer";
import { 
  Cloud, 
  Globe, 
  Cpu, 
  HardDrive, 
  Activity,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default async function SpaceDashboardPage() {
  const data = await getSpaceDashboardData();
  const { profile, projects, services } = data;

  if (!profile) return <div>Loading...</div>;

  // Aggregate stats
  const activeServices = services.filter(s => s.status === "active").length;
  const totalStorage = services.reduce((acc, s) => acc + s.limits.storageGB, 0);
  const totalBandwidth = services.reduce((acc, s) => acc + s.limits.bandwidthGB, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Space Cloud
        </h1>
        <p className="text-zinc-400">
          Managing <span className="text-white font-medium">{projects.length} Projects</span> across {activeServices} active services.
        </p>
      </div>

      {/* Active Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.filter(s => s.status === 'active').map(service => (
          <div key={service.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cloud className="w-24 h-24 text-purple-500" />
             </div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Cloud className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 uppercase">
                        {service.status}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{service.planName}</h3>
                <p className="text-sm text-zinc-400 mb-4">{service.type} Hosting</p>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Data Center</span>
                        <span className="text-zinc-300">{service.dataCenterId}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Resources</span>
                        <span className="text-zinc-300">{service.limits.vCPU ? `${service.limits.vCPU} vCPU / ${service.limits.ramGB} GB` : 'Standard'}</span>
                    </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-zinc-200">Active Websites</h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-white">{projects.length}</span>
          </div>
          <p className="text-sm text-zinc-500">
            {projects.filter(p => p.status === "active").length} healthy, {projects.filter(p => p.status !== "active").length} attention needed
          </p>
        </div>

        {/* Storage Usage */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-zinc-200">Total Storage</h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-white">{totalStorage} GB</span>
          </div>
          <p className="text-sm text-zinc-500">
            Across {activeServices} active plans
          </p>
        </div>

        {/* Bandwidth */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-zinc-200">Bandwidth Limit</h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-white">{totalBandwidth} GB</span>
          </div>
          <p className="text-sm text-zinc-500">
            Monthly aggregate transfer limit
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left: Projects List (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-zinc-400" />
              Your Projects
            </h2>
            <Link href="/dashboard/space/websites" className="text-sm text-purple-400 hover:text-purple-300">
                View All
            </Link>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-zinc-800">
              {projects.map((project) => (
                <div key={project.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                        project.type === "wordpress" ? "bg-blue-900/20 text-blue-400" :
                        project.type === "nodejs" ? "bg-green-900/20 text-green-400" :
                        "bg-zinc-800 text-zinc-400"
                    }`}>
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{project.domain}</p>
                      <p className="text-xs text-zinc-500">{project.name} • {project.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {project.status === "active" ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                                <CheckCircle className="w-3 h-3" /> Healthy
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
                                <AlertTriangle className="w-3 h-3" /> {project.status}
                            </div>
                        )}
                    </div>
                    <Link 
                        href={`/dashboard/space/websites?id=${project.id}`}
                        className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-white rounded border border-white/10 transition-colors"
                    >
                        Manage
                    </Link>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="p-8 text-center text-zinc-500">No active projects found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Infrastructure Status (1 col) */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">Infrastructure</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <Cloud className="w-5 h-5 text-zinc-400" />
                    <span className="text-zinc-300">Delhi Region (HQ)</span>
                </div>
                <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Operational
                </div>
            </div>

            <div className="space-y-3">
                {services.map(svc => (
                    <div key={svc.id} className="text-sm">
                        <div className="flex justify-between text-zinc-400 mb-1">
                            <span>{svc.planName}</span>
                            <span className="uppercase text-xs font-mono">{svc.status}</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full w-3/4 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-2">
                <Link href="/dashboard/space/resources" className="block w-full text-center py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded transition-colors">
                    View Resource Usage
                </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
