
"use client";

import { SpaceServiceProfile } from "@/types/space";
import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";

export function SpaceUserList({ services }: { services: SpaceServiceProfile[] }) {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filteredServices = services.filter(service => {
    if (filterType !== "all" && service.type !== filterType) return false;
    if (filterStatus !== "all" && service.status !== filterStatus) return false;
    
    if (search) {
        const q = search.toLowerCase();
        return service.userId.toLowerCase().includes(q) || 
               service.id.toLowerCase().includes(q) ||
               service.planName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
        <h3 className="font-bold text-white text-lg">Space Customers</h3>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-zinc-900/50 p-4 border border-zinc-800 rounded-lg">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input 
                    placeholder="Search User ID, Service ID, Plan..." 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <select 
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-400"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
            >
                <option value="all">All Types</option>
                <option value="Shared">Shared Hosting</option>
                <option value="Dedicated">Dedicated Hosting</option>
                <option value="CDN">CDN</option>
            </select>
            <select 
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-400"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="provisioning">Provisioning</option>
            </select>
        </div>

        {/* Table */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
             <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-900 text-zinc-200 uppercase font-medium text-xs">
                    <tr>
                        <th className="px-6 py-3">Service ID</th>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Plan Info</th>
                        <th className="px-6 py-3">Data Center</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-black">
                    {filteredServices.map(service => (
                        <tr key={service.id} className="group hover:bg-zinc-900/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                                {service.id}
                            </td>
                            <td className="px-6 py-4">
                                <Link href={`/admin/users/${service.userId}`} className="text-white font-medium hover:text-white">
                                    {service.userId}
                                </Link>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-white">{service.planName}</div>
                                <div className="text-xs text-zinc-500 capitalize">{service.type}</div>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs">
                                {service.dataCenterId}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider font-bold ${
                                    service.status === "active" ? "bg-green-900/30 text-green-400 border-green-900" : 
                                    service.status === "suspended" ? "bg-red-900/30 text-red-400 border-red-900" :
                                    "bg-zinc-800 text-zinc-400 border-zinc-700"
                                }`}>
                                    {service.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link href={`/admin/users/${service.userId}`} className="text-white hover:text-blue-400 text-xs font-medium">
                                    Manage
                                </Link>
                            </td>
                        </tr>
                    ))}
                    {filteredServices.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                No services found matching filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}
