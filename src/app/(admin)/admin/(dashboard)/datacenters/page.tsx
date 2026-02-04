
import { dcService } from "@/lib/services/datacenterService";
import { Server, MapPin } from "lucide-react";
import Link from "next/link";

export default async function DataCentersPage() {
  const centers = await dcService.getAll();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Centers</h1>
          <p className="text-zinc-400">Physical infrastructure capacity and deployment.</p>
        </div>
        {/* Admin-only add button could go here, but omitted for now per scope lock */}
      </div>

      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900 text-zinc-200 uppercase font-medium text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Active Nodes</th>
              <th className="px-6 py-3 text-right">Total Capacity</th>
              <th className="px-6 py-3 text-right">Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-black">
            {centers.map((dc) => (
              <tr 
                key={dc.id} 
                className="group hover:bg-zinc-900/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <Link href={`/admin/datacenters/${dc.id}`} className="block">
                    <div className="font-medium text-white group-hover:text-brand-blue transition-colors flex items-center gap-2">
                      <Server className="w-4 h-4 text-zinc-500" />
                      {dc.name}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 font-mono">{dc.id}</div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{dc.location.city}, {dc.location.country}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={dc.status} />
                </td>
                <td className="px-6 py-4 text-right font-mono text-white">
                  {dc.capacity.active}
                </td>
                <td className="px-6 py-4 text-right font-mono text-zinc-500">
                  {dc.capacity.total}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`font-mono font-medium ${
                    (dc.capacity.total - dc.capacity.active) < 10 
                      ? "text-red-400" 
                      : "text-green-400"
                  }`}>
                    {dc.capacity.total - dc.capacity.active}
                  </span>
                </td>
              </tr>
            ))}
            {centers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  No data centers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-900/30 text-green-400 border-green-900",
    planned: "bg-blue-900/30 text-blue-400 border-blue-900",
    retired: "bg-red-900/30 text-red-400 border-red-900",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider font-bold ${styles[status] || "bg-zinc-800"}`}>
      {status}
    </span>
  );
}
