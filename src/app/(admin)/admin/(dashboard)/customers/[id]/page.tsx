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
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Request failed");
  }
  return response.json();
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
        <button className={tabClass("activity")} onClick={() => setActiveTab("activity")}>Activity Logs</button>
      </div>

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
