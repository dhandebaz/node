
import { 
  CreditCard, 
  Calendar, 
  Download, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { getBillingOverview } from "@/app/actions/billing";

export default async function BillingPage() {
  const { subscriptions, paymentMethods, recentInvoices } = await getBillingOverview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Billing & Payments</h1>
        <p className="text-zinc-400">Manage subscriptions, payment methods, and billing history.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Subscriptions */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Active Subscriptions</h2>
            <div className="space-y-4">
              {subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <div key={sub.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-white text-lg">{sub.plan?.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          sub.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {sub.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm">
                        {sub.plan?.currency} {sub.plan?.price}/{sub.plan?.interval} • Renews on {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {sub.plan?.product === 'kaisa' ? (
                          <Link href="/dashboard/kaisa/credits" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors">
                            Top-up Credits
                          </Link>
                      ) : null}
                      <Link 
                        href={`/dashboard/billing/subscription/${sub.id}`}
                        className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-sm font-medium rounded-lg transition-colors"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                  <p className="text-zinc-400 mb-4">No active subscriptions found.</p>
                  <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Explore Plans
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Recent Invoices */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Invoices</h2>
              <Link href="/dashboard/billing/history" className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {recentInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 text-zinc-300">
                          {new Date(inv.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-white font-medium">
                          {inv.currency} {inv.amount}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                            <CheckCircle className="w-3 h-3" /> Paid
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-zinc-400 hover:text-white transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-8">
          
          {/* Payment Methods */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Payment Methods</h2>
              <Link href="/dashboard/billing/payment-methods" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                Manage
              </Link>
            </div>
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="flex items-center gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                    <CreditCard className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {pm.brand} •••• {pm.last4}
                    </div>
                    {pm.isDefault && (
                      <div className="text-xs text-zinc-500">Default</div>
                    )}
                  </div>
                </div>
              ))}
              <button className="w-full py-2 text-sm text-zinc-400 hover:text-white border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors">
                + Add Payment Method
              </button>
            </div>
          </section>

          {/* Billing Details */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Billing Details</h2>
               <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm text-zinc-400">
              <p className="text-white font-medium">Aditya Sharma</p>
              <p>Okhla Industrial Estate</p>
              <p>Phase III, New Delhi - 110020</p>
              <p>India</p>
              <div className="pt-2 mt-2 border-t border-zinc-800">
                <span className="text-xs uppercase tracking-wider text-zinc-500">GSTIN</span>
                <p className="font-mono text-zinc-300">07ABCDE1234F1Z5</p>
              </div>
            </div>
          </section>

          {/* Need Help? */}
          <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20">
            <h3 className="text-sm font-medium text-blue-400 mb-1">Have billing questions?</h3>
            <p className="text-xs text-blue-300/80 mb-3">
              Our support team can help you with invoices, refunds, and plan changes.
            </p>
            <Link href="/dashboard/support" className="text-xs font-medium text-white hover:underline">
              Contact Support
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
