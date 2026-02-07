"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function WalletPage() {
  const { walletBalance, transactions, fetchDashboardData, isLoading } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Wallet & Payouts</h1>
          <p className="text-white/60 text-sm">Manage your earnings and payout methods</p>
        </div>
        <button className="hidden md:flex items-center gap-2 bg-[var(--color-brand-red)] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#2A0A0A] to-[#3A1010] border border-white/10 rounded-2xl p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-20 bg-[var(--color-brand-red)] opacity-10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
           
           <div className="relative z-10">
             <div className="flex items-center gap-2 text-white/60 mb-2">
               <DollarSign className="w-5 h-5" />
               <span className="text-sm font-mono uppercase tracking-wider">Available Balance</span>
             </div>
             <div className="text-5xl font-bold tracking-tight mb-8">
               ₹{walletBalance.toLocaleString()}
             </div>

             <div className="flex gap-4">
               <button className="flex-1 bg-white text-[var(--color-brand-red)] py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg">
                 Withdraw
               </button>
               <button className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10">
                 Settings
               </button>
             </div>
           </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
           <div className="bg-[#2A0A0A] border border-white/10 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Income (30d)</span>
              </div>
              <div className="text-2xl font-bold text-white">₹45,200</div>
              <div className="text-xs text-green-500 mt-1">+12% vs last month</div>
           </div>
           <div className="bg-[#2A0A0A] border border-white/10 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <ArrowDownLeft className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
              </div>
              <div className="text-2xl font-bold text-white">₹12,800</div>
              <div className="text-xs text-white/40 mt-1">Clears in ~2 days</div>
           </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-[#2A0A0A] border border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white uppercase tracking-tight">Recent Transactions</h2>
          <button className="md:hidden text-xs text-white/60 bg-white/5 px-2 py-1 rounded">Export</button>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Description</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 text-sm text-white/60 whitespace-nowrap">
                    {format(new Date(tx.timestamp), 'MMM d, yyyy')}
                  </td>
                  <td className="py-4 px-6 text-sm text-white font-medium">
                    {tx.reason}
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-bold uppercase",
                      tx.status === 'completed' ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                    )}>
                      {tx.status}
                    </span>
                  </td>
                  <td className={cn(
                    "py-4 px-6 text-sm font-bold text-right",
                    tx.amount > 0 ? "text-green-400" : "text-white"
                  )}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-white/40">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-white/5">
           {transactions.map((tx) => (
             <div key={tx.id} className="p-4 active:bg-white/5 transition-colors">
               <div className="flex justify-between items-start mb-1">
                 <div className="font-medium text-white text-sm">{tx.reason}</div>
                 <div className={cn(
                   "font-bold text-sm",
                   tx.amount > 0 ? "text-green-400" : "text-white"
                 )}>
                   {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                 </div>
               </div>
               <div className="flex justify-between items-center">
                 <div className="text-xs text-white/40">{format(new Date(tx.timestamp), 'MMM d, h:mm a')}</div>
                 <span className={cn(
                   "text-[10px] font-bold uppercase",
                   tx.status === 'completed' ? "text-green-400" : "text-yellow-400"
                 )}>
                   {tx.status}
                 </span>
               </div>
             </div>
           ))}
           {transactions.length === 0 && !isLoading && (
             <div className="py-12 text-center text-white/40 text-sm">
               No recent transactions
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
