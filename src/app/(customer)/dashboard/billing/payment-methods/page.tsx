export const dynamic = 'force-dynamic';


import Link from "next/link";
import { ArrowLeft, CreditCard, Plus, Trash2 } from "lucide-react";
import { getBillingOverview } from "@/app/actions/billing";

export default async function PaymentMethodsPage() {
  const { paymentMethods } = await getBillingOverview();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link href="/dashboard/billing" className="inline-flex items-center gap-2 text-sm text-[var(--public-muted)] hover:text-[var(--public-ink)] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Billing
        </Link>
        <h1 className="text-2xl font-bold text-[var(--public-ink)] mb-1">Payment Methods</h1>
        <p className="text-[var(--public-muted)]">Manage your saved cards and payment details.</p>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((pm) => (
          <div key={pm.id} className="public-panel border border-[var(--public-line)] rounded-xl p-6 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--public-bg-soft)] text-[var(--public-ink)] rounded-lg border border-[var(--public-line)]">
                <CreditCard className="w-6 h-6 text-[var(--public-muted)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-[var(--public-ink)] capitalize">{pm.brand}</h3>
                  {pm.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--public-muted)]">Ending in •••• {pm.last4}</p>
              </div>
            </div>
            
            <button className="p-2 text-[var(--public-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Add New Method Button */}
        <button className="w-full py-4 border border-dashed border-[var(--public-line)] hover:border-zinc-500 rounded-xl flex items-center justify-center gap-2 text-[var(--public-muted)] hover:text-[var(--public-ink)] hover:public-panel/50 transition-all group">
          <div className="p-1 rounded-full bg-[var(--public-panel-muted)] group-hover:bg-zinc-700">
            <Plus className="w-4 h-4" />
          </div>
          <span className="font-medium">Add Payment Method</span>
        </button>
      </div>

      <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start">
        <CreditCard className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-400 mb-1">Secure Payments</h4>
          <p className="text-xs text-blue-300/80">
            Your payment information is securely handled by our payment partner (Razorpay/Stripe). 
            We do not store your full card details on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
