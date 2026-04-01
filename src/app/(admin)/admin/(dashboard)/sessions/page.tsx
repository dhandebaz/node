"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth, postWithAuth } from "@/lib/api/fetcher";
import { Users, Loader2, RefreshCw, LogOut, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionData {
  active_sessions: number;
  sessions: Array<{
    user_id: string;
    tenant_id: string | null;
    last_activity: string;
  }>;
  recent_users: Array<{
    id: string;
    email: string;
    name: string | null;
    created_at: string;
  }>;
  timestamp: string;
}

export default function AdminSessionsPage() {
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWithAuth<SessionData>("/api/admin/sessions");
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const logoutUser = async (userId: string) => {
    if (!confirm("Are you sure you want to force logout this user?")) {
      return;
    }

    setLoggingOut(userId);
    try {
      await postWithAuth("/api/admin/sessions", {
        user_id: userId,
        action: "logout"
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to logout user");
    } finally {
      setLoggingOut(null);
    }
  };

  const logoutAllUsers = async () => {
    if (!confirm("Are you sure you want to force logout ALL users? This will clear all cached sessions.")) {
      return;
    }

    try {
      const result = await postWithAuth<{ success: boolean; cleared: number }>("/api/admin/cache", {
        clear_all: true
      });
      await loadData();
      alert(`Cleared ${result.cleared} sessions`);
    } catch (err: any) {
      alert(err.message || "Failed to clear sessions");
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Session <span className="text-primary/40">Management</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Active user sessions &amp; force logout controls
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={logoutAllUsers}
            className="flex items-center gap-2 px-4 py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-destructive/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Clear All Sessions
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-3 bg-muted/30 px-6 py-4 rounded-2xl border border-border shadow-inner hover:bg-muted/50 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6">
          <p className="text-destructive">{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Active Sessions</span>
                <Users className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div className="text-3xl font-black text-foreground">
                {data.active_sessions}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Recent Users</span>
                <User className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div className="text-3xl font-black text-foreground">
                {data.recent_users.length}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Last Updated</span>
                <Clock className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div className="text-lg font-black text-foreground">
                {new Date(data.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Recent Users
              </h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em] border-b border-border">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recent_users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{user.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => logoutUser(user.id)}
                        disabled={loggingOut === user.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-destructive/20 transition-all disabled:opacity-50"
                      >
                        <LogOut className="w-3 h-3" />
                        {loggingOut === user.id ? "..." : "Force Logout"}
                      </button>
                    </td>
                  </tr>
                ))}
                {data.recent_users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
