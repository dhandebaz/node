"use client";

import { useState } from "react";
import { Users, UserPlus, Shield, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  status: "active" | "invited";
  lastActive?: string;
}

export function TeamManagement() {
  const [members] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Owner User",
      email: "owner@example.com",
      role: "admin",
      status: "active",
      lastActive: "Active now",
    },
    // Mock data for demonstration
    {
      id: "2",
      name: "Pending Invite",
      email: "staff@example.com",
      role: "member",
      status: "invited",
    }
  ]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-800 rounded-lg">
            <Users className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Team Management</h2>
            <p className="text-sm text-zinc-400">Invite and manage your collaborators</p>
          </div>
        </div>
        <button className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800/50 bg-zinc-950/50">
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Member</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{member.name}</div>
                      <div className="text-xs text-zinc-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Shield className={cn("w-3.5 h-3.5", member.role === "admin" ? "text-orange-400" : "text-zinc-500")} />
                    <span className={cn("text-xs font-medium capitalize", member.role === "admin" ? "text-orange-400" : "text-zinc-400")}>
                      {member.role}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {member.status === "active" ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        Invited
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {members.length === 0 && (
          <div className="p-12 text-center">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-zinc-500" />
              </div>
              <h3 className="text-white font-medium mb-1">No other members</h3>
              <p className="text-zinc-500 text-sm">Add your team to collaborate on Nodebase.</p>
          </div>
      )}
    </div>
  );
}
