"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Loader2, Wallet, Activity, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { cn } from "@/lib/utils";

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
      await fetchWithAuth("/api/admin/wallet/adjust", {
        method: "POST",
        body: JSON.stringify({
          tenant_id: adjustTenantId,
          amount: Number(adjustAmount),
          reason: adjustReason
        })
      });
      
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

  if (loading && !data) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  if (error) return <div className="p-8 text-destructive font-bold bg-destructive/10 border border-destructive/20 rounded-xl m-8">{error}</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Usage <span className="text-primary/40">Ledger</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Neural consumption & global credit orchestration
          </p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 px-6 py-4 rounded-2xl border border-border shadow-inner">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Ledger Synchronized</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-8 rounded-3xl shadow-sm transition-all hover:shadow-md hover:border-primary/20 group">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Tokens Today</span>
            <Zap className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-4xl font-black text-foreground tracking-tighter mb-2">{data?.summary.tokensToday.toLocaleString()}</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Total computational units</p>
        </div>

        <div className="bg-card border border-border p-8 rounded-3xl shadow-sm transition-all hover:shadow-md hover:border-primary/20 group">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Messages Today</span>
            <TrendingUp className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-4xl font-black text-foreground tracking-tighter mb-2">{data?.summary.messagesToday.toLocaleString()}</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Agentic interaction volume</p>
        </div>

        <div className="bg-card border border-primary/20 p-8 rounded-3xl shadow-lg shadow-primary/5 transition-all hover:shadow-primary/10 group">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Revenue Delta</span>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="text-4xl font-black text-foreground tracking-tighter mb-2">
            {data?.summary.costToday.toFixed(4)}
            <span className="text-xs text-muted-foreground/40 font-black uppercase ml-2 tracking-widest">Credits</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Real-time fiscal throughput</p>
        </div>
      </div>

      {/* Manual Adjustment */}
      <div className="bg-card border border-border p-10 rounded-3xl shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-32 translate-x-32 transition-colors group-hover:bg-primary/10" />
        <div className="mb-10 relative z-10">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-3">
            <Wallet className="w-5 h-5 text-primary" /> Authority Credit Override
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 mt-1">Manual adjustment of neural cluster liquidity</p>
        </div>
        <form onSubmit={handleAdjust} className="flex flex-col md:flex-row gap-8 items-end relative z-10">
          <div className="flex-1 w-full">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-3 block ml-1">Business_Node_ID</label>
            <input 
              value={adjustTenantId} 
              onChange={e => setAdjustTenantId(e.target.value)}
              placeholder="UUID_AUTH_KEY"
              className="w-full bg-muted/20 border border-border rounded-xl px-4 py-4 text-foreground text-[11px] font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/20 border-border hover:border-primary/20"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-3 block ml-1">Credit_Delta</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/20 font-mono text-[11px]">₹</span>
              <input 
                type="number"
                value={adjustAmount} 
                onChange={e => setAdjustAmount(e.target.value)}
                placeholder="0.0000"
                className="w-full bg-muted/20 border border-border rounded-xl pl-8 pr-4 py-4 text-foreground text-[11px] font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-primary/20"
              />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-3 block ml-1">Audit_Protocol_Reason</label>
            <input 
              value={adjustReason} 
              onChange={e => setAdjustReason(e.target.value)}
              placeholder="REFUND / BONUS / CORRECTION"
              className="w-full bg-muted/20 border border-border rounded-xl px-4 py-4 text-foreground text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-primary/20"
            />
          </div>
          <button 
            disabled={adjusting}
            className="w-full md:w-auto bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] px-10 py-4.5 rounded-xl hover:opacity-90 disabled:opacity-50 text-[11px] shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
          >
            {adjusting ? "SYNCHRONIZING..." : "EXECUTE_OVERRIDE"}
          </button>
        </form>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm group">
        <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Active_Ledger_Registry</h3>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Historical architectural debt & credit logs</p>
          </div>
          <AlertCircle className="w-4 h-4 text-muted-foreground/20" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black tracking-[0.3em] border-b border-border">
              <tr>
                <th className="px-8 py-6">Execution_Time</th>
                <th className="px-8 py-6">Tenant_Authority</th>
                <th className="px-8 py-6">Protocol_Type</th>
                <th className="px-8 py-6 text-right">Credit_Delta</th>
                <th className="px-8 py-6">Audit_Memo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.walletTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-all group/row border-b border-border/50 last:border-0 border-dashed">
                  <td className="px-8 py-6 whitespace-nowrap font-mono text-[10px] font-bold text-muted-foreground/30">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-foreground font-black uppercase tracking-widest text-[10px] group-hover/row:text-primary transition-colors">{tx.tenant_name}</div>
                    <div className="text-[9px] font-mono text-muted-foreground/20 cursor-pointer hover:text-primary transition-colors uppercase tracking-widest mt-1" onClick={() => setAdjustTenantId(tx.tenant_id)}>
                      {tx.tenant_id.split("-")[0]}...
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all",
                      tx.type === 'ai_usage' ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_10px_rgba(214,0,28,0.05)]' :
                      tx.type === 'top_up' ? 'bg-success/10 text-success border-success/30 shadow-[0_0_10px_rgba(34,197,94,0.05)]' :
                      'bg-muted text-muted-foreground/40 border-border'
                    )}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={cn(
                    "px-8 py-6 font-mono font-black text-[11px] text-right tracking-tighter",
                    tx.amount < 0 ? 'text-destructive' : 'text-success'
                  )}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(4)}
                  </td>
                  <td className="px-8 py-6 truncate max-w-xs text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tight italic">
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
