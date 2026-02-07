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
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet & Payouts</h1>
          <p className="text-gray-500 text-sm">Manage your earnings and payout methods</p>
        </div>
        <button className="flex items-center gap-2 bg-[var(--color-brand-red)] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white relative overflow-hidden">
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
               <button className="flex-1 bg-white text-gray-900 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                 Withdraw Funds
               </button>
               <button className="flex-1 bg-white/10 text-white py-2.5 rounded-lg font-bold hover:bg-white/20 transition-colors backdrop-blur-sm">
                 Payout Settings
               </button>
             </div>
           </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
           <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Income (30d)</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">₹45,200</div>
              <div className="text-xs text-green-600 mt-1">+12% vs last month</div>
           </div>
           <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <ArrowDownLeft className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">₹12,800</div>
              <div className="text-xs text-gray-400 mt-1">Clears in ~2 days</div>
           </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                    {format(new Date(tx.timestamp), 'MMM d, yyyy')}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                    {tx.reason}
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-bold uppercase",
                      tx.status === 'completed' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                      {tx.status}
                    </span>
                  </td>
                  <td className={cn(
                    "py-4 px-6 text-sm font-bold text-right",
                    tx.amount > 0 ? "text-green-600" : "text-gray-900"
                  )}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
