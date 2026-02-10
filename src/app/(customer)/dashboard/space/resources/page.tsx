export const dynamic = 'force-dynamic';

import { getSpaceDashboardData } from "@/app/actions/customer";
import { Cpu, HardDrive, Zap, Network, Cloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SpaceResourcesPage() {
  const data = await getSpaceDashboardData();
  const { usage, projects } = data;

  if (!projects || projects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Resources</h1>
          <p className="text-zinc-400">Monitor your infrastructure usage and limits.</p>
        </div>
        <Card className="bg-zinc-900 border-zinc-800 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="p-4 rounded-full bg-zinc-800 text-zinc-400">
                <Cloud className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">No active resources</h3>
                <p className="text-zinc-400 max-w-sm">
                  Resources are allocated when you deploy a website. Launch your first project to see usage stats.
                </p>
              </div>
              <Button asChild variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                <Link href="/dashboard/space/websites/new">
                  Deploy Website
                </Link>
              </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = [
    {
      label: "CPU Usage",
      value: `${usage.cpu}%`,
      total: "100%",
      icon: Cpu,
      color: "text-blue-500",
      barColor: "bg-blue-500",
      detail: "4 vCPUs allocated"
    },
    {
      label: "Memory Usage",
      value: `${usage.memory}%`,
      total: "8 GB",
      icon: Zap,
      color: "text-yellow-500",
      barColor: "bg-yellow-500",
      detail: "High performance RAM"
    },
    {
      label: "Storage",
      value: `${usage.storage}%`,
      total: "100 GB",
      icon: HardDrive,
      color: "text-purple-500",
      barColor: "bg-purple-500",
      detail: "NVMe SSD"
    },
    {
      label: "Bandwidth",
      value: `${usage.bandwidth}%`,
      total: "5 TB",
      icon: Network,
      color: "text-green-500",
      barColor: "bg-green-500",
      detail: "Global CDN enabled"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Resources</h1>
        <p className="text-zinc-400">Monitor your infrastructure usage and limits.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-lg bg-zinc-800 ${metric.color}`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">{metric.label}</div>
                <div className="text-2xl font-bold text-white">{metric.value} <span className="text-sm text-zinc-500 font-normal">/ {metric.total}</span></div>
              </div>
            </div>
            
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${metric.barColor}`} 
                style={{ width: metric.value.replace('%', '') + '%' }}
              ></div>
            </div>
            <p className="text-xs text-zinc-500">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Plan Details</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
            <div className="text-sm text-zinc-400 mb-1">Current Plan</div>
            <div className="text-xl font-bold text-white">Pro Bundle</div>
          </div>
          <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
            <div className="text-sm text-zinc-400 mb-1">Billing Cycle</div>
            <div className="text-xl font-bold text-white">Monthly</div>
          </div>
          <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
            <div className="text-sm text-zinc-400 mb-1">Next Invoice</div>
            <div className="text-xl font-bold text-white">Oct 1, 2024</div>
          </div>
        </div>
      </div>
    </div>
  );
}
