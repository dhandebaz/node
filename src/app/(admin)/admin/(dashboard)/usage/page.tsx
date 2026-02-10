"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Loader2, Wallet } from "lucide-react";

type Transaction = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  type: string;
  amount: number;
  description: string;
  timestamp: string;
  metadata?: any;
};

type UsagePayload = {
  summary: { tokensToday: number; messagesToday: number; costToday: number };
  byDay: Array<{ date: string; tokens: number; messages: number; cost: number }>;
  walletTransactions: Transaction[];
};

export default function AdminUsagePage() {
  const [data, setData] = useState<UsagePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Adjustment Form State
  const [adjustTenantId, setAdjustTenantId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/usage")
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTenantId || !adjustAmount || !adjustReason) return;
    
    setAdjusting(true);
    try {
      const res = await fetch("/api/admin/wallet/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: adjustTenantId,
          amount: Number(adjustAmount),
          reason: adjustReason
        })
      });
      if (!res.ok) throw new Error("Failed");
      
      setAdjustTenantId("");
      setAdjustAmount("");
      setAdjustReason("");
      alert("Adjustment successful");
      fetchData(); // Refresh
    } catch (err) {
      alert("Failed to adjust");
    } finally {
      setAdjusting(false);
    }
  };

  if (loading && !data) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-white" /></div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Usage & Wallets</h1>
          <p className="text-zinc-400">Monitor token consumption and manage credits.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
          <p className="text-xs uppercase text-zinc-500 font-bold">Tokens Today</p>
          <p className="text-2xl font-mono text-white mt-2">{data?.summary.tokensToday.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
          <p className="text-xs uppercase text-zinc-500 font-bold">Messages Today</p>
          <p className="text-2xl font-mono text-white mt-2">{data?.summary.messagesToday.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
          <p className="text-xs uppercase text-zinc-500 font-bold">Revenue/Cost Today</p>
          <p className="text-2xl font-mono text-green-400 mt-2">{data?.summary.costToday.toFixed(4)} Credits</p>
        </div>
      </div>

      {/* Manual Adjustment */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5" /> Manual Wallet Adjustment
        </h3>
        <form onSubmit={handleAdjust} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-zinc-500 mb-1 block">Tenant ID</label>
            <input 
              value={adjustTenantId} 
              onChange={e => setAdjustTenantId(e.target.value)}
              placeholder="UUID"
              className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs text-zinc-500 mb-1 block">Amount (+/-)</label>
            <input 
              type="number"
              value={adjustAmount} 
              onChange={e => setAdjustAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="text-xs text-zinc-500 mb-1 block">Reason</label>
            <input 
              value={adjustReason} 
              onChange={e => setAdjustReason(e.target.value)}
              placeholder="Refund / Bonus / Correction"
              className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
          <button 
            disabled={adjusting}
            className="bg-white text-black font-bold px-4 py-2 rounded hover:bg-zinc-200 disabled:opacity-50"
          >
            {adjusting ? "Processing..." : "Execute"}
          </button>
        </form>
      </div>

      {/* Recent Transactions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="font-bold text-white">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-zinc-400">
            <thead className="bg-black text-zinc-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Tenant</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data?.walletTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{tx.tenant_name}</div>
                    <div className="text-xs font-mono text-zinc-600 cursor-pointer hover:text-zinc-400" onClick={() => setAdjustTenantId(tx.tenant_id)}>
                      {tx.tenant_id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      tx.type === 'ai_usage' ? 'bg-blue-900/30 text-blue-400' :
                      tx.type === 'top_up' ? 'bg-green-900/30 text-green-400' :
                      'bg-zinc-800 text-zinc-300'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-mono font-bold ${
                    tx.amount < 0 ? 'text-zinc-400' : 'text-green-400'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 truncate max-w-xs">
                    {tx.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
