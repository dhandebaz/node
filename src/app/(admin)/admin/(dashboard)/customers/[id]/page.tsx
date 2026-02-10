"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

type CustomerDetail = {
  profile: {
    id: string;
    businessName: string;
    phone: string;
    createdAt: string | null;
    status: string;
  };
  aiManager: {
    slug: string | null;
    planPrice: number;
    status: string;
  };
  wallet: {
    balance: number;
    transactions: Array<{ id: string; type: string; amount: number; reason: string; status: string; timestamp: string }>;
  };
  usage: {
    tokensUsed: number;
    messages: number;
    events: Array<{ id: string; manager_slug: string; tokens_used: number; message_count: number; created_at: string }>;
  };
  integrations: Array<{ id: string; provider: string; status: string; last_sync: string | null; expires_at: string | null; error_code: string | null }>;
  activityLogs: Array<{ id: string; severity: string; service: string; message: string; timestamp: string }>;
  controls?: {
    is_ai_enabled: boolean;
    is_messaging_enabled: boolean;
    is_bookings_enabled: boolean;
    is_wallet_enabled: boolean;
    early_access: boolean;
  };
  tenantId?: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Request failed");
  }
  return response.json();
}

function OverrideForm({ type, label, placeholder, onSuccess }: { type: string, label: string, placeholder: string, onSuccess: () => void }) {
  const [id, setId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reason) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch("/api/admin/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, reason })
      });
      
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Action failed");
      }
      
      setMessage({ text: "Success", type: "success" });
      setId("");
      setReason("");
      onSuccess();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-zinc-500 block mb-1">{label}</label>
        <input 
          type="text" 
          value={id} 
          onChange={e => setId(e.target.value)} 
          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-zinc-700 outline-none"
          placeholder={placeholder}
        />
      </div>
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Reason (Required)</label>
        <input 
          type="text" 
          value={reason} 
          onChange={e => setReason(e.target.value)} 
          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-zinc-700 outline-none"
          placeholder="Why are you overriding this?"
        />
      </div>
      {message && (
        <div className={`text-xs ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {message.text}
        </div>
      )}
      <button 
        type="submit" 
        disabled={loading || !id || !reason}
        className="w-full py-2 bg-white text-black rounded text-xs font-bold hover:bg-zinc-200 disabled:opacity-50 transition-colors"
      >
        {loading ? "Processing..." : "Apply Override"}
      </button>
    </form>
  );
}

export type TenantControlKey =
  | 'is_ai_enabled'
  | 'is_messaging_enabled'
  | 'is_bookings_enabled'
  | 'is_wallet_enabled'
  | 'early_access';

function ToggleSwitch({ label, checked, onChange, disabled }: { label: string, checked: boolean, onChange: () => void, disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-zinc-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [walletAdjustment, setWalletAdjustment] = useState(0);
  const [walletReason, setWalletReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadCustomer = () => {
    if (!id) return;
    setLoading(true);
    fetchJson<CustomerDetail>(`/api/admin/customers/${id}`)
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const toggleStatus = async () => {
    if (!data) return;
    const nextStatus = data.aiManager.status === "active" ? "paused" : "active";
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/customers/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to update status");
      }
      loadCustomer();
    } catch (err: any) {
      setError(err.message || "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const adjustWallet = async () => {
    if (!data || !walletAdjustment) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/customers/${id}/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: walletAdjustment, reason: walletReason })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to adjust wallet");
      }
      setWalletAdjustment(0);
      setWalletReason("");
      loadCustomer();
    } catch (err: any) {
      setError(err.message || "Failed to adjust wallet");
    } finally {
      setUpdating(false);
    }
  };

  const toggleControl = async (control: TenantControlKey, currentValue: boolean) => {
    if (!data?.tenantId) return;
    
    // Prompt for reason
    const reason = prompt("Why are you changing this control? (Required for audit log)");
    if (!reason) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/tenants/${data.tenantId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ control, value: !currentValue, reason })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to update control");
      }
      loadCustomer();
    } catch (err: any) {
      setError(err.message || "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const tabClass = (tab: string) =>
    `px-4 py-2 text-xs uppercase tracking-widest border-b-2 ${activeTab === tab ? "text-white border-white" : "text-zinc-500 border-transparent hover:text-zinc-300"}`;

  const walletBalance = useMemo(() => new Intl.NumberFormat("en-IN").format(data?.wallet.balance || 0), [data?.wallet.balance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-300">
        {error || "Customer not found."}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{data.profile.businessName}</h1>
          <p className="text-zinc-400 text-sm">{data.profile.phone || "No phone on record"}</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-zinc-800">
        <button className={tabClass("profile")} onClick={() => setActiveTab("profile")}>Profile</button>
        <button className={tabClass("ai")} onClick={() => setActiveTab("ai")}>AI Manager</button>
        <button className={tabClass("wallet")} onClick={() => setActiveTab("wallet")}>Wallet & Usage</button>
        <button className={tabClass("integrations")} onClick={() => setActiveTab("integrations")}>Integrations</button>
        <button className={tabClass("controls")} onClick={() => setActiveTab("controls")}>Controls</button>
        <button className={tabClass("overrides")} onClick={() => setActiveTab("overrides")}>Overrides</button>
        <button className={tabClass("activity")} onClick={() => setActiveTab("activity")}>Activity Logs</button>
      </div>

      {activeTab === "overrides" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Manual Overrides</h3>
            <p className="text-sm text-zinc-400">Emergency actions. Use with caution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Override */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
              <div>
                <div className="text-sm font-medium text-white mb-1">Force Confirm Booking</div>
                <p className="text-xs text-zinc-400">Manually mark a booking as confirmed.</p>
              </div>
              <OverrideForm 
                type="booking_confirm" 
                label="Booking ID" 
                placeholder="e.g. bkg_123..." 
                onSuccess={loadCustomer}
              />
            </div>

            {/* KYC Override */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
              <div>
                <div className="text-sm font-medium text-white mb-1">Force Verify ID</div>
                <p className="text-xs text-zinc-400">Manually mark a booking's guest ID as verified.</p>
              </div>
              <OverrideForm 
                type="kyc_approve" 
                label="Booking ID" 
                placeholder="e.g. bkg_123..." 
                onSuccess={loadCustomer}
              />
            </div>

            {/* Payment Override */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
              <div>
                <div className="text-sm font-medium text-white mb-1">Mark Payment Paid</div>
                <p className="text-xs text-zinc-400">Manually mark a payment transaction as completed.</p>
              </div>
              <OverrideForm 
                type="payment_mark_paid" 
                label="Payment ID" 
                placeholder="e.g. pay_123..." 
                onSuccess={loadCustomer}
              />
            </div>

            {/* Wallet Reversal Override */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
              <div>
                <div className="text-sm font-medium text-white mb-1">Reverse Wallet Debit</div>
                <p className="text-xs text-zinc-400">Refund a debit transaction back to wallet.</p>
              </div>
              <OverrideForm 
                type="wallet_reverse_debit" 
                label="Transaction ID" 
                placeholder="e.g. tx_123..." 
                onSuccess={loadCustomer}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "controls" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Tenant Controls</h3>
            <p className="text-sm text-zinc-400">Manage high-risk capabilities for this tenant.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Control */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-white">AI Employees</div>
                  <div className={`px-2 py-0.5 rounded text-xs ${data.controls?.is_ai_enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {data.controls?.is_ai_enabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Controls whether AI employees can reply to messages and take actions.
                </p>
              </div>
              <button
                onClick={() => toggleControl("is_ai_enabled", !!data.controls?.is_ai_enabled)}
                disabled={updating}
                className={`w-full py-2 rounded-md text-xs font-semibold transition-colors ${
                  data.controls?.is_ai_enabled
                    ? "bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50"
                    : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-900/50"
                }`}
              >
                {data.controls?.is_ai_enabled ? "Pause AI" : "Resume AI"}
              </button>
            </div>

            {/* Messaging Control */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-white">Messaging</div>
                  <div className={`px-2 py-0.5 rounded text-xs ${data.controls?.is_messaging_enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {data.controls?.is_messaging_enabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Controls outbound messages (manual & AI). Inbound messages are still received.
                </p>
              </div>
              <button
                onClick={() => toggleControl("is_messaging_enabled", !!data.controls?.is_messaging_enabled)}
                disabled={updating}
                className={`w-full py-2 rounded-md text-xs font-semibold transition-colors ${
                  data.controls?.is_messaging_enabled
                    ? "bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50"
                    : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-900/50"
                }`}
              >
                {data.controls?.is_messaging_enabled ? "Pause Messaging" : "Resume Messaging"}
              </button>
            </div>

            {/* Bookings Control */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-white">Bookings</div>
                  <div className={`px-2 py-0.5 rounded text-xs ${data.controls?.is_bookings_enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {data.controls?.is_bookings_enabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Controls whether new bookings can be created via any channel.
                </p>
              </div>
              <button
                onClick={() => toggleControl("is_bookings_enabled", !!data.controls?.is_bookings_enabled)}
                disabled={updating}
                className={`w-full py-2 rounded-md text-xs font-semibold transition-colors ${
                  data.controls?.is_bookings_enabled
                    ? "bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50"
                    : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-900/50"
                }`}
              >
                {data.controls?.is_bookings_enabled ? "Freeze Bookings" : "Unfreeze Bookings"}
              </button>
            </div>

            {/* Wallet Control */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-white">Wallet</div>
                  <div className={`px-2 py-0.5 rounded text-xs ${data.controls?.is_wallet_enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {data.controls?.is_wallet_enabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Controls wallet usage. If disabled, paid features will fail gracefully.
                </p>
              </div>
              <button
                onClick={() => toggleControl("is_wallet_enabled", !!data.controls?.is_wallet_enabled)}
                disabled={updating}
                className={`w-full py-2 rounded-md text-xs font-semibold transition-colors ${
                  data.controls?.is_wallet_enabled
                    ? "bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50"
                    : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-900/50"
                }`}
              >
                {data.controls?.is_wallet_enabled ? "Freeze Wallet" : "Unfreeze Wallet"}
              </button>
            </div>

            {/* Early Access Control */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-white">Early Access</div>
                  <div className={`px-2 py-0.5 rounded text-xs ${data.controls?.early_access ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500"}`}>
                    {data.controls?.early_access ? "Active" : "Inactive"}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Grants access to beta features for the First 100 cohort.
                </p>
              </div>
              <button
                onClick={() => toggleControl("early_access", !!data.controls?.early_access)}
                disabled={updating}
                className={`w-full py-2 rounded-md text-xs font-semibold transition-colors ${
                  data.controls?.early_access
                    ? "bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50"
                    : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-900/50"
                }`}
              >
                {data.controls?.early_access ? "Revoke Access" : "Grant Access"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500">Business Name</div>
            <div className="mt-2 text-white">{data.profile.businessName}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500">Phone</div>
            <div className="mt-2 text-white">{data.profile.phone || "—"}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500">Created</div>
            <div className="mt-2 text-white">
              {data.profile.createdAt ? new Date(data.profile.createdAt).toLocaleString() : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500">Status</div>
            <div className="mt-2 text-white">{data.profile.status}</div>
          </div>
        </div>
      )}

      {activeTab === "ai" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">AI Manager</div>
              <div className="mt-2 text-white">{data.aiManager.slug || "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">Plan Price</div>
              <div className="mt-2 text-white">₹{new Intl.NumberFormat("en-IN").format(data.aiManager.planPrice || 0)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">Status</div>
              <div className="mt-2 text-white">{data.aiManager.status}</div>
            </div>
          </div>
          <div>
            <button
              onClick={toggleStatus}
              className="px-4 py-2 bg-white text-black rounded-md text-sm font-semibold hover:bg-zinc-200 transition-colors"
              disabled={updating}
            >
              {data.aiManager.status === "active" ? "Pause AI Manager" : "Resume AI Manager"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">Wallet Balance</div>
              <div className="text-2xl font-semibold text-white mt-2">₹{walletBalance}</div>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <input
                type="number"
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
                value={walletAdjustment}
                onChange={(e) => setWalletAdjustment(Number(e.target.value))}
                placeholder="Adjustment amount"
              />
              <input
                type="text"
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
                value={walletReason}
                onChange={(e) => setWalletReason(e.target.value)}
                placeholder="Reason"
              />
              <button
                onClick={adjustWallet}
                className="px-4 py-2 bg-white text-black rounded-md text-sm font-semibold hover:bg-zinc-200 transition-colors"
                disabled={updating}
              >
                Apply Adjustment
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Usage Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-zinc-300">
              <div>
                <div className="text-xs uppercase tracking-widest text-zinc-500">Tokens Used</div>
                <div className="mt-2 text-white">{new Intl.NumberFormat("en-IN").format(data.usage.tokensUsed)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-zinc-500">Messages</div>
                <div className="mt-2 text-white">{new Intl.NumberFormat("en-IN").format(data.usage.messages)}</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 overflow-auto">
            <h3 className="text-sm font-semibold text-white mb-4">Wallet Transactions</h3>
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data.wallet.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-4 py-3">{tx.type}</td>
                    <td className="px-4 py-3">₹{new Intl.NumberFormat("en-IN").format(tx.amount || 0)}</td>
                    <td className="px-4 py-3 text-zinc-400">{tx.reason || "—"}</td>
                    <td className="px-4 py-3">{tx.status}</td>
                    <td className="px-4 py-3 text-zinc-500">{new Date(tx.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
                {data.wallet.transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-zinc-500">
                      No wallet activity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 overflow-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Sync</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Error Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data.integrations.map((integration) => (
                <tr key={integration.id}>
                  <td className="px-4 py-3 text-white">{integration.provider}</td>
                  <td className="px-4 py-3">{integration.status}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {integration.expires_at ? new Date(integration.expires_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-red-400">{integration.error_code || "—"}</td>
                </tr>
              ))}
              {data.integrations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-zinc-500">
                    No integrations connected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 overflow-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data.activityLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3">{log.severity}</td>
                  <td className="px-4 py-3">{log.service}</td>
                  <td className="px-4 py-3 text-zinc-400">{log.message}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
              {data.activityLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-zinc-500">
                    No activity logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
