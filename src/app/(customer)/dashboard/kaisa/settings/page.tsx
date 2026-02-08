"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import { 
  CreditCard, 
  QrCode, 
  Settings, 
  Zap,
  Save,
  Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { paymentsApi } from "@/lib/api/payments";

export default function KaisaSettingsPage() {
  const { host } = useAuthStore();
  const { walletBalance } = useDashboardStore();
  const [saving, setSaving] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("not_set");
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const searchParams = useSearchParams();

  if (!host) {
     return (
        <div className="flex items-center justify-center h-[50vh]">
           <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
     );
  }

  const handleSave = () => {
    setSaving(true);
    // Mock save
    setTimeout(() => setSaving(false), 1500);
  };

  const loadPaymentSetup = async () => {
    try {
      const data = await paymentsApi.getPaymentSetup();
      setPaymentStatus(data.status || "not_set");
      setOnboardingUrl(data.onboardingUrl || null);
    } catch {
      setPaymentStatus("not_set");
      setOnboardingUrl(null);
    }
  };

  useEffect(() => {
    loadPaymentSetup();
  }, []);

  useEffect(() => {
    if (searchParams.get("onboarding") === "complete") {
      setSetupLoading(true);
      paymentsApi.completePaymentSetup()
        .then((data) => {
          setPaymentStatus(data.status || "active");
          setOnboardingUrl(data.onboardingUrl || null);
        })
        .finally(() => setSetupLoading(false));
    }
  }, [searchParams]);

  const handleStartSetup = async () => {
    try {
      setSetupLoading(true);
      const data = await paymentsApi.startPaymentSetup();
      setPaymentStatus(data.status || "setup_in_progress");
      setOnboardingUrl(data.onboardingUrl || null);
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    } finally {
      setSetupLoading(false);
    }
  };

  const handleResumeSetup = () => {
    if (onboardingUrl) {
      window.location.href = onboardingUrl;
    }
  };

  const handleCompleteSetup = async () => {
    try {
      setSetupLoading(true);
      const data = await paymentsApi.completePaymentSetup();
      setPaymentStatus(data.status || "active");
      setOnboardingUrl(data.onboardingUrl || null);
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-500">Manage your profile, billing, and preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
           <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
             <div className="w-16 h-16 rounded-full bg-[var(--color-brand-red)] text-white flex items-center justify-center text-2xl font-bold">
               {host.name.charAt(0)}
             </div>
             <div>
               <h2 className="text-xl font-bold text-gray-900">{host.name}</h2>
               <p className="text-gray-500">{host.email}</p>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Business Name</label>
                <input 
                  type="text" 
                  defaultValue={host.businessName || "My Homestay"}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone</label>
                <input 
                  type="text" 
                  defaultValue="+91 98765 43210"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)]"
                />
              </div>
           </div>
        </div>

        {/* Plan Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Subscription Plan</h2>
              <p className="text-sm text-gray-500">Your current Nodebase plan</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Current Plan</div>
              <div className="text-xl font-bold text-gray-900 capitalize">Pro Manager</div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700">
              Active
            </div>
          </div>
        </div>

        {/* Payment Collection */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Payout Settings</h2>
              <p className="text-sm text-gray-500">Connect Razorpay to receive guest payments</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment status</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">
                  {paymentStatus === "active"
                    ? "Active"
                    : paymentStatus === "setup_in_progress"
                      ? "Setup in progress"
                      : "Not set up"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Guests pay you directly through Razorpay. Nodebase never stores bank details.
                </p>
              </div>
              {paymentStatus === "active" && (
                <div className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700">
                  Active
                </div>
              )}
            </div>

            {paymentStatus !== "active" && (
              <div className="flex flex-wrap gap-3">
                {paymentStatus === "not_set" && (
                  <button
                    onClick={handleStartSetup}
                    disabled={setupLoading}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-60"
                  >
                    {setupLoading ? "Starting..." : "Set up payouts"}
                  </button>
                )}

                {paymentStatus === "setup_in_progress" && (
                  <>
                    <button
                      onClick={handleResumeSetup}
                      disabled={!onboardingUrl || setupLoading}
                      className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-60"
                    >
                      {setupLoading ? "Opening..." : "Resume onboarding"}
                    </button>
                    <button
                      onClick={handleCompleteSetup}
                      disabled={setupLoading}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-60"
                    >
                      I've completed onboarding
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
           <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 bg-[var(--color-brand-red)] text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
           >
             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             Save Changes
           </button>
        </div>
      </div>
    </div>
  );
}
