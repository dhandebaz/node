
import { 
  getBillingOverview, 
  cancelSubscriptionAction, 
  resumeSubscriptionAction 
} from "@/app/actions/billing";
import { billingService } from "@/lib/services/billingService";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { SubscriptionStatus } from "@/types/billing";

// Client component for actions would be better, but for now using form actions in server component
// We'll make a simple client wrapper for the buttons to handle loading states if needed, 
// or just use Server Actions directly in forms.

export default async function SubscriptionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { subscriptions } = await getBillingOverview();
  const subscription = subscriptions.find(s => s.id === id);

  if (!subscription) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link href="/dashboard/billing" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Billing
        </Link>
        <h1 className="text-2xl font-bold text-white mb-1">Manage Subscription</h1>
        <p className="text-zinc-400">
          Plan details and management for <span className="text-white font-medium">{subscription.plan?.name}</span>
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                subscription.status === 'active' ? 'bg-green-500/10' : 'bg-yellow-500/10'
              }`}>
                {subscription.status === 'active' ? (
                  <CheckCircle className={`w-6 h-6 ${subscription.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`} />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{subscription.plan?.name}</h2>
                <p className="text-sm text-zinc-400">
                  {subscription.plan?.currency} {subscription.plan?.price} / {subscription.plan?.interval}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
              subscription.status === 'active' 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            }`}>
              {subscription.status.toUpperCase()}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-zinc-500 mb-1">Current Period Start</span>
              <span className="text-zinc-300">{new Date(subscription.currentPeriodStart).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="block text-zinc-500 mb-1">Renews On</span>
              <span className="text-zinc-300">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-zinc-950/30 space-y-4">
          
          {subscription.cancelAtPeriodEnd ? (
             <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
              <h3 className="text-yellow-400 font-medium mb-1">Cancellation Scheduled</h3>
              <p className="text-sm text-yellow-300/80 mb-3">
                Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. Access will continue until then.
              </p>
              <form action={async () => {
                "use server";
                await resumeSubscriptionAction(subscription.id);
              }}>
                <button type="submit" className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg text-sm hover:bg-yellow-400 transition-colors">
                  Resume Subscription
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
               <button 
                disabled
                className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-400 font-medium rounded-lg text-sm cursor-not-allowed border border-zinc-700"
                title="Upgrade/Downgrade flows coming soon"
               >
                 Change Plan
               </button>
               
               <form action={async () => {
                  "use server";
                  await cancelSubscriptionAction(subscription.id);
               }}>
                  <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-red-500/10 text-red-400 font-medium rounded-lg text-sm hover:bg-red-500/20 border border-red-500/20 transition-colors">
                    Cancel Subscription
                  </button>
               </form>
            </div>
          )}
          
          {!subscription.cancelAtPeriodEnd && (
             <p className="text-xs text-zinc-500 text-center sm:text-left">
              To upgrade or downgrade, please cancel your current plan first or contact support.
            </p>
          )}
        </div>
      </div>

      {/* Features Included */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Included Features</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {subscription.plan?.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-zinc-300 text-sm">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
