"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDownLeft, Calendar, Download, Wallet } from "lucide-react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { SessionExpiredCard } from "@/components/customer/SessionExpiredCard";
import { SessionExpiredError } from "@/lib/api/errors";

type BillingSummary = {
  aiManager: { name: string | null; slug: string | null } | null;
  baseMonthlyPrice: number | null;
  currency: string | null;
  status: "active" | "past_due" | "paused" | "canceled" | string;
  nextBillingDate: string | null;
};

type WalletSnapshot = {
  balance: number;
  status: "active" | "paused" | string;
};

type WalletTransaction = {
  id: string;
  type: "credit" | "debit" | string;
  amount: number;
  reason?: string | null;
  timestamp: string;
  status?: string | null;
};

type InvoiceRecord = {
  id: string;
  date: string;
  description?: string | null;
  amount: number;
  currency?: string | null;
  status?: string | null;
  pdfUrl?: string | null;
};

const presetAmounts = [500, 1000, 2000, 5000];

const formatCredits = (value: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);

const formatCurrency = (value: number, currency?: string | null) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0
  }).format(value);

const getDateLabel = (iso: string) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = date.toDateString() === today.toDateString();
  const sameYesterday = date.toDateString() === yesterday.toDateString();
  if (sameDay) return "Today";
  if (sameYesterday) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const statusLabel = (status?: string) => {
  if (!status) return "Active";
  if (status === "past_due") return "Past Due";
  if (status === "paused") return "Paused";
  if (status === "canceled") return "Canceled";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function BillingPage() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(presetAmounts[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [topUpError, setTopUpError] = useState<string | null>(null);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setTransactionsError(null);
      setInvoicesError(null);

      const results = await Promise.allSettled([
        fetchWithAuth<BillingSummary>("/api/billing/summary"),
        fetchWithAuth<WalletSnapshot>("/api/wallet"),
        fetchWithAuth<WalletTransaction[]>("/api/wallet/transactions"),
        fetchWithAuth<InvoiceRecord[]>("/api/invoices")
      ]);

      const summaryResult = results[0];
      const walletResult = results[1];
      const transactionsResult = results[2];
      const invoicesResult = results[3];

      if (summaryResult.status === "rejected" || walletResult.status === "rejected") {
        if (summaryResult.status === "rejected" && summaryResult.reason instanceof SessionExpiredError) {
          setSessionExpired(true);
          return;
        }
        if (walletResult.status === "rejected" && walletResult.reason instanceof SessionExpiredError) {
          setSessionExpired(true);
          return;
        }
        throw new Error("Connect your wallet to view billing.");
      }

      setSummary(summaryResult.value);
      setWallet(walletResult.value);

      if (transactionsResult.status === "fulfilled") {
        setTransactions(transactionsResult.value || []);
      } else {
        setTransactions([]);
        if (transactionsResult.reason instanceof SessionExpiredError) {
          setSessionExpired(true);
          return;
        }
        setTransactionsError("Usage will appear once AI starts working.");
      }

      if (invoicesResult.status === "fulfilled") {
        setInvoices(invoicesResult.value || []);
      } else {
        setInvoices([]);
        if (invoicesResult.reason instanceof SessionExpiredError) {
          setSessionExpired(true);
          return;
        }
        setInvoicesError("Invoices will appear once billing is active.");
      }
    } catch (err: any) {
      if (err instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
      setError("Billing will appear once your account is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const basePrice = summary?.baseMonthlyPrice || 0;
  const walletBalance = wallet?.balance || 0;
  const emptyBalance = walletBalance === 0;
  const lowBalance = walletBalance > 0 && basePrice > 0 && walletBalance < basePrice;
  const paused = summary?.status === "paused" || emptyBalance;

  const usageTransactions = useMemo(
    () => transactions.filter((tx) => tx.type === "debit"),
    [transactions]
  );

  const effectiveAmount = selectedPreset ?? Number(customAmount);
  const amountValid = Number.isFinite(effectiveAmount) && effectiveAmount > 0;

  const handleTopUp = async () => {
    if (!amountValid) {
      setTopUpError("Select a valid credit amount.");
      return;
    }

    try {
      setTopUpLoading(true);
      setTopUpError(null);
      await fetchWithAuth<{ balance: number }>("/api/wallet/topup", {
        method: "POST",
        body: JSON.stringify({ amount: Number(effectiveAmount) })
      });
      setShowTopUp(false);
      setCustomAmount("");
      setSelectedPreset(presetAmounts[1]);
      await loadData();
    } catch (err: any) {
      if (err instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
      setTopUpError("Top up failed.");
    } finally {
      setTopUpLoading(false);
    }
  };

  if (sessionExpired) {
    return <SessionExpiredCard />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-400">
        Loading billing details...
      </div>
    );
  }

  if (error || !summary || !wallet) {
    return (
      <div className="dashboard-surface p-6 text-zinc-300">
        {error || "Billing will appear once your account is active."}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Wallet</h1>
        <p className="text-zinc-400">Transparent pricing, credits, and usage in one place.</p>
      </div>

      {(lowBalance || emptyBalance) && (
        <div className={`border rounded-xl p-4 flex items-start gap-3 ${emptyBalance ? "border-red-500/40 bg-red-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
          <AlertTriangle className={emptyBalance ? "w-5 h-5 text-red-400" : "w-5 h-5 text-amber-400"} />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">
              {emptyBalance ? "Wallet empty" : "Low wallet balance"}
            </div>
            <div className="text-xs text-zinc-300">
              {emptyBalance ? "AI Manager is paused until credits are added." : "Top up credits to avoid a pause."}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 dashboard-surface p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">AI Manager hired</div>
              <div className="text-xl font-semibold text-white mt-2">
                {summary.aiManager?.name || "Unassigned"}
              </div>
              <div className="text-sm text-zinc-400 mt-1">
                Base monthly price
              </div>
              <div className="text-lg font-semibold text-white mt-1">
                {basePrice > 0 ? formatCurrency(basePrice, summary.currency) : "Not set"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-zinc-500">Subscription status</div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-2 ${paused ? "bg-red-500/10 text-red-300" : summary.status === "past_due" ? "bg-amber-500/10 text-amber-300" : "bg-emerald-500/10 text-emerald-300"}`}>
                {paused ? "Paused" : statusLabel(summary.status)}
              </div>
              <div className="text-xs text-zinc-400 mt-3">Next billing date</div>
              <div className="text-sm text-white mt-1 flex items-center justify-end gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                {summary.nextBillingDate ? new Date(summary.nextBillingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not scheduled"}
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-white/70">
            <Wallet className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest">Wallet balance</span>
          </div>
          <div className="text-4xl font-bold text-white">{formatCredits(walletBalance)}</div>
          <div className="text-xs uppercase tracking-widest text-white/60">
            Status: {emptyBalance ? "Empty" : lowBalance ? "Low balance" : "Healthy"}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowTopUp(true)}
              className="flex-1 bg-white text-black text-sm font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              Top up credits
            </button>
            <button
              onClick={() => document.getElementById("usage-breakdown")?.scrollIntoView({ behavior: "smooth" })}
              className="flex-1 bg-white/10 text-white text-sm font-semibold py-3 rounded-xl border border-white/10 hover:bg-white/20 transition-colors"
            >
              View usage
            </button>
          </div>
        </section>
      </div>

      <section id="usage-breakdown" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">AI usage deductions</h2>
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Most recent</span>
        </div>
        <div className="dashboard-surface divide-y divide-white/10">
          {transactionsError && (
            <div className="p-6 text-sm text-zinc-500">{transactionsError}</div>
          )}
          {!transactionsError && usageTransactions.length === 0 && (
            <div className="p-6 text-sm text-zinc-500">No AI usage deductions yet.</div>
          )}
          {!transactionsError && usageTransactions.map((tx) => (
            <div key={tx.id} className="p-5 flex items-center justify-between">
              <div>
                <div className="text-sm text-white">{tx.reason || "AI activity"}</div>
                <div className="text-xs text-zinc-500">{getDateLabel(tx.timestamp)}</div>
              </div>
              <div className="text-sm font-semibold text-red-300 flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4" />
                -{formatCredits(tx.amount)} credits
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Invoices & payment history</h2>
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Read-only</span>
        </div>

        <div className="dashboard-surface">
          <div className="hidden md:block">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-zinc-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4 text-zinc-300">
                      {new Date(inv.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {inv.description || "Invoice"}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      {formatCurrency(inv.amount, inv.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/10 text-white">
                        {inv.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.pdfUrl ? (
                        <a href={inv.pdfUrl} className="inline-flex items-center gap-2 text-sm text-white hover:text-zinc-200">
                          <Download className="w-4 h-4" />
                          PDF
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-500">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && !invoicesError && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      No invoices available.
                    </td>
                  </tr>
                )}
                {invoicesError && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      {invoicesError}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-white/10">
            {invoices.length === 0 && !invoicesError && (
              <div className="p-6 text-sm text-zinc-500">No invoices available.</div>
            )}
            {invoicesError && (
              <div className="p-6 text-sm text-zinc-500">{invoicesError}</div>
            )}
            {!invoicesError && invoices.map((inv) => (
              <div key={inv.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white">{inv.description || "Invoice"}</div>
                  <span className="text-xs text-zinc-500">{new Date(inv.date).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold text-white">{formatCurrency(inv.amount, inv.currency)}</div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/10 text-white">
                    {inv.status || "Pending"}
                  </span>
                </div>
                {inv.pdfUrl ? (
                  <a href={inv.pdfUrl} className="inline-flex items-center gap-2 text-sm text-white">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                ) : (
                  <span className="text-xs text-zinc-500">PDF unavailable</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 px-4 py-6">
          <div className="dashboard-surface w-full max-w-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Top up credits</h3>
              <p className="text-sm text-zinc-400">Credits are used only when AI works.</p>
            </div>

            <div className="space-y-3">
              <div className="text-xs uppercase tracking-widest text-zinc-500">Choose an amount</div>
              <div className="grid grid-cols-2 gap-3">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedPreset(amount);
                      setCustomAmount("");
                    }}
                    className={`py-3 rounded-xl border text-sm font-semibold ${selectedPreset === amount ? "border-white text-white bg-white/10" : "border-white/20 text-zinc-300 hover:border-white/40"}`}
                  >
                    {formatCredits(amount)} credits
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-widest text-zinc-500">Custom amount</div>
              <input
                value={customAmount}
                onChange={(event) => {
                  setCustomAmount(event.target.value);
                  setSelectedPreset(null);
                }}
                placeholder="Enter credits"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/60"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Credits are used only when AI works</span>
              <span>AI pauses automatically if balance is empty</span>
            </div>

            {topUpError && (
              <div className="text-xs text-red-400">{topUpError}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowTopUp(false)}
                className="flex-1 py-3 rounded-xl border border-white/20 text-sm text-zinc-300 hover:border-white/40"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUp}
                disabled={topUpLoading}
                className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 disabled:opacity-60"
              >
                {topUpLoading ? "Processing..." : "Proceed to payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
