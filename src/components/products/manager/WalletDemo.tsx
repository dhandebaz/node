"use client";

import { useState, useEffect } from "react";
import { paymentsApi } from "@/lib/api/payments";
import { WalletTransaction } from "@/types";
import { Loader2, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export function WalletDemo() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletData, txData] = await Promise.all([
          paymentsApi.getWalletBalance(),
          paymentsApi.getTransactions(),
        ]);
        setBalance(walletData.balance);
        setTransactions(txData);
      } catch (error) {
        console.error("Failed to fetch wallet data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-brand-bone/5 rounded-xl border border-brand-bone/10 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-bone/10 rounded-lg">
            <Wallet className="w-5 h-5 text-brand-bone" />
          </div>
          <div>
            <p className="text-xs text-brand-bone/60 uppercase tracking-widest font-mono">Wallet Balance</p>
            {loading ? (
              <div className="h-6 w-20 bg-brand-bone/10 animate-pulse rounded mt-1" />
            ) : (
              <p className="text-2xl font-bold text-brand-bone">₹{balance.toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-brand-bone/40 uppercase tracking-widest font-mono mb-2">Recent Transactions</p>
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-12 w-full bg-brand-bone/5 animate-pulse rounded-lg" />)
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-brand-bone/5 hover:bg-brand-bone/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${tx.type === 'credit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                </div>
                <div>
                  <p className="text-sm text-brand-bone font-medium">{tx.reason}</p>
                  <p className="text-[10px] text-brand-bone/40 font-mono">{new Date(tx.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-sm font-mono ${tx.type === 'credit' ? 'text-green-400' : 'text-brand-bone'}`}>
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
