"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth, postWithAuth } from "@/lib/api/fetcher";
import { 
  Building, 
  ArrowLeft, 
  Loader2, 
  Users, 
  Wallet, 
  Settings,
  Power,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  Zap,
  Calendar,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

type TenantControlKey =
  | 'is_ai_enabled'
  | 'is_messaging_enabled'
  | 'is_bookings_enabled'
  | 'is_wallet_enabled'
  | 'early_access';

interface Tenant {
  id: string;
  name: string;
  username: string | null;
  phone: string | null;
  timezone: string;
  business_type: string | null;
  kyc_status: string;
  kyc_verified_at: string | null;
  created_at: string;
  is_ai_enabled: boolean;
  is_messaging_enabled: boolean;
  is_bookings_enabled: boolean;
  is_wallet_enabled: boolean;
  early_access: boolean;
  owner_user_id: string;
}

interface TenantUser {
  id: string;
  role: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    avatar_url: string | null;
  };
}

interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  reason: string;
  status: string;
  created_at: string;
}

interface TenantDetail {
  tenant: Tenant;
  users: TenantUser[];
  stats: {
    total_bookings: number;
    total_messages: number;
  };
  wallet: {
    id: string;
    tenant_id: string;
    balance: number;
    credit_limit: number;
    created_at: string;
    updated_at: string;
  } | null;
  recent_transactions: WalletTransaction[];
}

async function fetchJson<T>(url: string): Promise<T> {
  return fetchWithAuth<T>(url, { cache: "no-store" });
}

function ToggleSwitch({ label, description, checked, onChange, disabled, loading }: { 
  label: string; 
  description?: string;
  checked: boolean; 
  onChange: () => void; 
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border transition-all group",
      checked 
        ? "bg-card border-border hover:border-primary/40 shadow-inner" 
        : "bg-destructive/5 border-destructive/20 shadow-lg shadow-destructive/5"
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-black text-xs uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
            {label}
          </h4>
          {description && (
            <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/50">{description}</p>
          )}
        </div>
        <button
          onClick={onChange}
          disabled={disabled || loading}
          className={cn(
            "w-12 h-6 rounded-full relative transition-all duration-500 shadow-inner",
            checked ? "bg-success/20" : "bg-destructive/20",
            (disabled || loading) && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className={cn(
            "absolute top-1 w-4 h-4 rounded-full transition-all duration-500 shadow-lg",
            checked ? "left-7 bg-success shadow-success/40" : "left-1 bg-destructive shadow-destructive/40"
          )} />
        </button>
      </div>
      {loading && (
        <div className="mt-4 flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Updating...</span>
        </div>
      )}
    </div>
  );
}

export default function AdminTenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [updating, setUpdating] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const loadTenant = () => {
    if (!id) return;
    setLoading(true);
    fetchJson<TenantDetail>(`/api/admin/tenants/${id}`)
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTenant();
  }, [id]);

  const loadActivities = async () => {
    if (!id) return;
    setLoadingActivities(true);
    try {
      const data = await fetchWithAuth<{ activities: any[] }>(`/api/admin/tenants/${id}/activity`);
      setActivities(data.activities || []);
    } catch (err) {
      console.error("Failed to load activities", err);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    if (activeTab === "activity") {
      loadActivities();
    }
  }, [activeTab]);

  const toggleControl = async (control: TenantControlKey, currentValue: boolean) => {
    if (!data?.tenant) return;
    
    const reason = prompt("Why are you changing this control? (Required for audit log)");
    if (!reason) return;

    setToggling(control);
    try {
      await postWithAuth(`/api/admin/tenants/${id}/control`, {
        control,
        value: !currentValue,
        reason
      });
      loadTenant();
    } catch (err: any) {
      setError(err.message || "Failed to update control");
    } finally {
      setToggling(null);
    }
  };

  const suspendTenant = async () => {
    if (!data?.tenant) return;
    
    const reason = prompt("Why are you suspending this tenant? (Required for audit log)");
    if (!reason) return;

    if (!confirm(`Are you sure you want to SUSPEND "${data.tenant.name}"? This will prevent all access.`)) {
      return;
    }

    setUpdating(true);
    try {
      await postWithAuth(`/api/admin/tenants/${id}`, {
        method: "DELETE",
        body: { reason }
      });
      loadTenant();
    } catch (err: any) {
      setError(err.message || "Failed to suspend tenant");
    } finally {
      setUpdating(false);
    }
  };

  const reactivateTenant = async () => {
    if (!data?.tenant) return;
    
    if (!confirm(`Are you sure you want to REACTIVATE "${data.tenant.name}"?`)) {
      return;
    }

    setUpdating(true);
    try {
      await postWithAuth(`/api/admin/tenants/${id}`, {
        method: "PATCH",
        body: { kyc_status: "verified" }
      });
      loadTenant();
    } catch (err: any) {
      setError(err.message || "Failed to reactivate tenant");
    } finally {
      setUpdating(false);
    }
  };

  const getKycBadge = (kycStatus: string) => {
    switch (kycStatus) {
      case "verified":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20"><CheckCircle className="w-3 h-3" /> VERIFIED</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-warning/10 text-warning border border-warning/20"><Clock className="w-3 h-3" /> PENDING</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-destructive/10 text-destructive border border-destructive/20"><XCircle className="w-3 h-3" /> REJECTED</span>;
      case "suspended":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-destructive/10 text-destructive border border-destructive/20"><AlertTriangle className="w-3 h-3" /> SUSPENDED</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-muted/30 text-muted-foreground border border-border"><Clock className="w-3 h-3" /> NOT_STARTED</span>;
    }
  };

  const tabClass = (tab: string) => cn(
    "px-4 py-3 text-xs uppercase tracking-widest border-b-2 transition-colors",
    activeTab === tab 
      ? "text-foreground border-primary bg-primary/5" 
      : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="bg-card border border-destructive/20 rounded-lg p-6">
        <p className="text-destructive">{error || "Tenant not found."}</p>
        <Link href="/admin/tenants" className="text-primary hover:underline mt-4 inline-block">
          ← Back to Tenants
        </Link>
      </div>
    );
  }

  const { tenant, users, stats, wallet, recent_transactions } = data;
  const isSuspended = tenant.kyc_status === "suspended" || tenant.kyc_status === "rejected";

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/tenants" className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">{tenant.name}</h1>
          <p className="text-sm text-muted-foreground font-mono">@{tenant.username || tenant.id}</p>
        </div>
        <div className="flex items-center gap-3">
          {getKycBadge(tenant.kyc_status)}
          {isSuspended ? (
            <button
              onClick={reactivateTenant}
              disabled={updating}
              className="px-4 py-2 bg-success/10 text-success border border-success/20 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-success/20 transition-all"
            >
              {updating ? "Reactivating..." : "Reactivate"}
            </button>
          ) : (
            <button
              onClick={suspendTenant}
              disabled={updating}
              className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-destructive/20 transition-all"
            >
              {updating ? "Suspending..." : "Suspend"}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-border overflow-x-auto">
        <button className={tabClass("profile")} onClick={() => setActiveTab("profile")}>Profile</button>
        <button className={tabClass("users")} onClick={() => setActiveTab("users")}>Users</button>
        <button className={tabClass("wallet")} onClick={() => setActiveTab("wallet")}>Wallet</button>
        <button className={tabClass("stats")} onClick={() => setActiveTab("stats")}>Stats</button>
        <button className={tabClass("controls")} onClick={() => setActiveTab("controls")}>Controls</button>
        <button className={tabClass("activity")} onClick={() => setActiveTab("activity")}>Activity</button>
      </div>

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Tenant Name</label>
                <p className="text-foreground font-medium">{tenant.name}</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Username</label>
                <p className="text-foreground font-mono">@{tenant.username || "Not set"}</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Phone</label>
                <p className="text-foreground font-mono">{tenant.phone || "Not set"}</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Timezone</label>
                <p className="text-foreground font-mono">{tenant.timezone}</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Business Type</label>
                <p className="text-foreground uppercase font-bold">{tenant.business_type || "Not set"}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">KYC Status</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Status</label>
                <div className="mt-1">{getKycBadge(tenant.kyc_status)}</div>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Verified At</label>
                <p className="text-foreground font-mono">
                  {tenant.kyc_verified_at ? new Date(tenant.kyc_verified_at).toLocaleString() : "Not verified"}
                </p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Created At</label>
                <p className="text-foreground font-mono">
                  {tenant.created_at ? new Date(tenant.created_at).toLocaleString() : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black tracking-[0.3em] border-b border-border">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                        {u.user.name?.[0]?.toUpperCase() || u.user.email[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{u.user.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-sm">{u.user.email}</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-sm">{u.user.phone || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest",
                      u.role === "owner" 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : u.role === "admin"
                        ? "bg-warning/10 text-warning border border-warning/20"
                        : "bg-muted/30 text-muted-foreground border border-border"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-sm">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Wallet Balance</h3>
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div className="text-4xl font-black text-foreground">
              ₹{new Intl.NumberFormat("en-IN").format(wallet?.balance || 0)}
            </div>
            {wallet?.credit_limit && (
              <p className="text-sm text-muted-foreground mt-2">
                Credit Limit: ₹{wallet.credit_limit}
              </p>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Recent Transactions</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-muted/30 text-muted-foreground uppercase text-[9px] font-black tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent_transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest",
                        tx.type === "credit" 
                          ? "bg-success/10 text-success border border-success/20" 
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      )}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-foreground">
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground text-sm">{tx.reason}</td>
                    <td className="px-6 py-3 text-muted-foreground font-mono text-sm">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {recent_transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No transactions</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "stats" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Total Bookings</span>
            </div>
            <div className="text-3xl font-black text-foreground">{stats.total_bookings}</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-success" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Total Messages</span>
            </div>
            <div className="text-3xl font-black text-foreground">{stats.total_messages}</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Wallet Balance</span>
            </div>
            <div className="text-3xl font-black text-foreground">₹{new Intl.NumberFormat("en-IN").format(wallet?.balance || 0)}</div>
          </div>
        </div>
      )}

      {activeTab === "controls" && (
        <div className="space-y-6">
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive">Tenant-Specific Controls</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              These controls override the global system flags for this tenant. Changes are logged for audit.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleSwitch
              label="AI Replies"
              description="Enable/disable AI auto-replies for this tenant"
              checked={tenant.is_ai_enabled}
              onChange={() => toggleControl('is_ai_enabled', tenant.is_ai_enabled)}
              loading={toggling === 'is_ai_enabled'}
            />
            <ToggleSwitch
              label="Messaging"
              description="Enable/disable outbound messaging"
              checked={tenant.is_messaging_enabled}
              onChange={() => toggleControl('is_messaging_enabled', tenant.is_messaging_enabled)}
              loading={toggling === 'is_messaging_enabled'}
            />
            <ToggleSwitch
              label="Bookings"
              description="Enable/disable booking creation"
              checked={tenant.is_bookings_enabled}
              onChange={() => toggleControl('is_bookings_enabled', tenant.is_bookings_enabled)}
              loading={toggling === 'is_bookings_enabled'}
            />
            <ToggleSwitch
              label="Wallet"
              description="Enable/disable wallet functionality"
              checked={tenant.is_wallet_enabled}
              onChange={() => toggleControl('is_wallet_enabled', tenant.is_wallet_enabled)}
              loading={toggling === 'is_wallet_enabled'}
            />
            <ToggleSwitch
              label="Early Access"
              description="Grant early access to new features"
              checked={tenant.early_access}
              onChange={() => toggleControl('early_access', tenant.early_access)}
              loading={toggling === 'early_access'}
            />
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Tenant Activity Log</h3>
              <Activity className="w-5 h-5 text-muted-foreground/40" />
            </div>
            
            {loadingActivities ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No activity recorded yet</p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 shrink-0",
                      activity.severity === "error" ? "bg-destructive" :
                      activity.severity === "warn" ? "bg-warning" : "bg-success"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium">{activity.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="font-mono uppercase">{activity.service}</span>
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
