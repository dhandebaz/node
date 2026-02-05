
"use client";

import { User } from "@/types/user";
import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";

export function KaisaUserList({ users }: { users: User[] }) {
  const [filterType, setFilterType] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(user => {
    if (!user.products.kaisa) return false;
    
    if (filterType !== "all" && user.products.kaisa.businessType !== filterType) return false;
    if (filterRole !== "all" && user.products.kaisa.role !== filterRole) return false;
    
    if (search) {
        const q = search.toLowerCase();
        return user.identity.id.toLowerCase().includes(q) || 
               user.identity.phone.includes(q) || 
               user.identity.email?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
        <h3 className="font-bold text-white text-lg">Active kaisa Users</h3>
        
        {/* Filters */}
        <div className="flex gap-4 bg-zinc-900/50 p-4 border border-zinc-800 rounded-lg">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input 
                    placeholder="Search ID, Phone, Email..." 
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
                <option value="all">All Business Types</option>
                <option value="Doctor">Doctor</option>
                <option value="Homestay">Homestay</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
            </select>
            <select 
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-400"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
            >
                <option value="all">All Roles</option>
                <option value="manager">Manager</option>
                <option value="co-founder">Co-founder</option>
            </select>
        </div>

        {/* Table */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
             <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-900 text-zinc-200 uppercase font-medium text-xs">
                    <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Business Type</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-black">
                    {filteredUsers.map(user => (
                        <tr key={user.identity.id} className="group hover:bg-zinc-900/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="text-white font-medium">{user.identity.email || user.identity.phone}</div>
                                <div className="text-xs text-zinc-600 font-mono">{user.identity.id}</div>
                            </td>
                            <td className="px-6 py-4">{user.products.kaisa?.businessType}</td>
                            <td className="px-6 py-4 capitalize">{user.products.kaisa?.role}</td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    {/* Account Status */}
                                    <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider font-bold ${
                                        user.status.account === "active" ? "bg-zinc-900 text-zinc-400 border-zinc-800" : "bg-red-900/20 text-red-500 border-red-900/50"
                                    }`}>
                                        {user.status.account === "active" ? "ACC: OK" : "ACC: SUS"}
                                    </span>
                                    
                                    {/* Kaisa Status */}
                                    <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider font-bold ${
                                        user.products.kaisa?.status === "active" ? "bg-green-900/30 text-green-400 border-green-900" : "bg-amber-900/30 text-amber-400 border-amber-900"
                                    }`}>
                                        {user.products.kaisa?.status || "active"}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link href={`/admin/users/${user.identity.id}`} className="text-white hover:text-blue-400 text-xs font-medium">
                                    Manage
                                </Link>
                            </td>
                        </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No users found.</td></tr>
                    )}
                </tbody>
             </table>
        </div>
    </div>
  );
}
