"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, TrendingDown, TrendingUp, CreditCard, History, X, Loader2 } from "lucide-react";
import Script from "next/script";

interface WalletTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

interface WalletUIProps {
  initialBalance: number;
  history: WalletTransaction[];
  usage24h: number;
  plan: string;
  isPaused?: boolean;
  pauseReason?: string;
}

export function WalletUI({ initialBalance, history, usage24h, plan, isPaused, pauseReason }: WalletUIProps) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance); // Local state for immediate feedback if needed
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(500); // Default 500
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    try {
      setLoading(true);
      
      // 1. Create Order
      const res = await fetch("/api/billing/top-up/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: topUpAmount })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Open Razorpay
      const options = {
        key: data.keyId,
        amount: data.amount * 100, // paise
        currency: data.currency,
        name: "Nodebase AI",
        description: `Top up ${topUpAmount} Credits`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch("/api/billing/top-up/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                credits: topUpAmount
              })
            });

            if (!verifyRes.ok) throw new Error("Verification failed");

            // Success
            alert("Credits added successfully!");
            setIsTopUpOpen(false);
            setBalance(prev => prev + topUpAmount); // Optimistic update
            router.refresh(); // Refresh server data
          } catch (err) {
            console.error(err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (newPlan: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        body: JSON.stringify({ plan: newPlan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Nodebase AI",
        description: `Upgrade to ${newPlan}`,
        handler: function(response: any) {
          alert("Subscription successful! Credits will be added shortly.");
          router.refresh();
        },
        theme: { color: "#000000" }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Pause Alert */}
      {isPaused && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
            <X className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-red-900">AI Actions Paused</h3>
            <p className="text-sm text-red-700 mt-1">{pauseReason}</p>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Top Up Wallet</h3>
              <button onClick={() => setIsTopUpOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Amount (Credits)</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[100, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        topUpAmount === amt 
                          ? "bg-black text-white border-black" 
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {amt} Credits
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    ≈ ₹{topUpAmount}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  1 Credit = ₹1.00 INR. Minimum recharge: 100 Credits.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>₹{topUpAmount}.00</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Payable</span>
                  <span>₹{topUpAmount}.00</span>
                </div>
              </div>

              <button
                onClick={handleTopUp}
                disabled={loading || topUpAmount < 100}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Proceed to Pay ₹{topUpAmount}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet & Usage</h1>
          <p className="text-gray-500">Manage your AI credits and view consumption history.</p>
        </div>
        <button 
          onClick={() => setIsTopUpOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
        >
          <CreditCard className="w-4 h-4" />
          Top Up Credits
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Available Balance</p>
              <h3 className="text-2xl font-bold">{balance.toFixed(2)} Credits</h3>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            1 Credit ≈ ₹1.00 INR (approx)
          </div>
        </div>

        {/* Usage Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Usage (24h)</p>
              <h3 className="text-2xl font-bold">{usage24h.toFixed(2)} Credits</h3>
            </div>
          </div>
          <p className="text-xs text-gray-400">Total cost incurred in last 24 hours.</p>
        </div>

        {/* Plan Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Current Plan</p>
              <h3 className="text-2xl font-bold capitalize">{plan}</h3>
            </div>
          </div>
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Active
          </p>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Subscription Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className={`border rounded-xl p-6 ${plan === 'starter' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                <h4 className="font-bold text-lg">Starter</h4>
                <p className="text-2xl font-bold mt-2">Free</p>
                <p className="text-sm text-gray-500 mb-4">500 Credits/mo</p>
                <ul className="text-sm space-y-2 mb-6">
                    <li>✓ 1 Listing</li>
                    <li>✓ 1 Integration</li>
                    <li>✓ Basic AI Access</li>
                </ul>
                {plan === 'starter' ? (
                    <button disabled className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed">Current Plan</button>
                ) : (
                   <button disabled className="w-full py-2 border border-gray-300 rounded-lg font-medium text-gray-500 cursor-not-allowed">Default</button>
                )}
            </div>

            {/* Pro */}
            <div className={`border rounded-xl p-6 ${plan === 'pro' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-lg">Pro</h4>
                    {plan === 'pro' && <span className="text-xs bg-black text-white px-2 py-1 rounded">Active</span>}
                </div>
                <p className="text-2xl font-bold mt-2">₹999<span className="text-sm font-normal text-gray-500">/mo</span></p>
                <p className="text-sm text-gray-500 mb-4">5,000 Credits/mo</p>
                <ul className="text-sm space-y-2 mb-6">
                    <li>✓ 5 Listings</li>
                    <li>✓ 3 Integrations</li>
                    <li>✓ Priority AI Support</li>
                </ul>
                {plan === 'pro' ? (
                    <button disabled className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed">Current Plan</button>
                ) : (
                    <button 
                        onClick={() => handleUpgrade('pro')}
                        disabled={loading}
                        className="w-full py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
                    >
                        Upgrade to Pro
                    </button>
                )}
            </div>

            {/* Business */}
            <div className={`border rounded-xl p-6 ${plan === 'business' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-lg">Business</h4>
                    {plan === 'business' && <span className="text-xs bg-black text-white px-2 py-1 rounded">Active</span>}
                </div>
                <p className="text-2xl font-bold mt-2">₹4,999<span className="text-sm font-normal text-gray-500">/mo</span></p>
                <p className="text-sm text-gray-500 mb-4">30,000 Credits/mo</p>
                <ul className="text-sm space-y-2 mb-6">
                    <li>✓ 50 Listings</li>
                    <li>✓ 10 Integrations</li>
                    <li>✓ Dedicated Support</li>
                </ul>
                {plan === 'business' ? (
                    <button disabled className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed">Current Plan</button>
                ) : (
                    <button 
                        onClick={() => handleUpgrade('business')}
                        disabled={loading}
                        className="w-full py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
                    >
                        Upgrade to Business
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-500" />
          <h3 className="font-bold text-gray-900">Transaction History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {tx.description || "Transaction"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      tx.type === 'top_up' ? 'bg-green-100 text-green-700' : 
                      tx.type === 'ai_usage' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${
                    tx.amount < 0 ? 'text-gray-600' : 'text-green-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(4)}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No transactions yet.
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
