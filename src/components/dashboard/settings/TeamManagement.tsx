"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Shield,
  MoreVertical,
  Loader2,
  Mail,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "admin" | "member" | "owner";
  status: "active" | "invited";
  lastActive?: string;
}

interface InviteFormState {
  email: string;
  role: "admin" | "member";
}

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState<InviteFormState>({
    email: "",
    role: "member",
  });
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/team/members");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Failed to load team (${res.status})`);
      }
      const data = await res.json();
      setMembers(data.members ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async () => {
    if (!invite.email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    setInviting(true);
    try {
      const res = await fetch("/api/team/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: invite.email.trim(), role: invite.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send invite");
      toast.success(`Invite sent to ${invite.email}`);
      setInvite({ email: "", role: "member" });
      setShowInvite(false);
      fetchMembers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from your team?`)) return;
    setRemovingId(memberId);
    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to remove member");
      toast.success(`${memberName} removed from team`);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="public-panel border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <Users className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Team Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Invite and manage your collaborators
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInvite((v) => !v)}
          className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div className="p-6 border-b border-border bg-muted text-foreground/60">
          <p className="text-sm font-medium text-foreground mb-3">
            Invite a new team member
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={invite.email}
              onChange={(e) =>
                setInvite((v) => ({ ...v, email: e.target.value }))
              }
              placeholder="colleague@example.com"
              className="flex-1 bg-black/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <select
              value={invite.role}
              onChange={(e) =>
                setInvite((v) => ({
                  ...v,
                  role: e.target.value as "admin" | "member",
                }))
              }
              className="bg-black/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-zinc-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={inviting}
              className="bg-purple-600 hover:bg-purple-500 text-foreground px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {inviting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Send Invite
            </button>
            <button
              onClick={() => setShowInvite(false)}
              className="text-muted-foreground hover:text-foreground text-sm px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="p-0 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading team…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={fetchMembers}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Try again
            </button>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-foreground font-medium mb-1">No other members</h3>
            <p className="text-muted-foreground text-sm">
              Add your team to collaborate on Nodebase.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted text-foreground/50">
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Member
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Role
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Last Active
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                        {(member.name || member.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {member.name || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield
                        className={cn(
                          "w-3.5 h-3.5",
                          member.role === "owner" || member.role === "admin"
                            ? "text-orange-400"
                            : "text-muted-foreground",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium capitalize",
                          member.role === "owner" || member.role === "admin"
                            ? "text-orange-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {member.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {member.status === "active" ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit">
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit">
                        Invited
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {member.lastActive || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {member.role !== "owner" ? (
                      <button
                        onClick={() =>
                          handleRemove(member.id, member.name || member.email)
                        }
                        disabled={removingId === member.id}
                        className="p-2 hover:bg-red-900/20 rounded-lg text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-40"
                        title="Remove member"
                      >
                        {removingId === member.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="p-2 rounded-lg text-zinc-700 cursor-not-allowed"
                        title="Owner cannot be removed"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
