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
import { useState } from "react";

export default function KaisaSettingsPage() {
  const { host } = useAuthStore();
  const { walletBalance } = useDashboardStore();
  const [saving, setSaving] = useState(false);

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
              <p className="text-sm text-gray-500">How you receive money from guests</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your UPI ID (VPA)</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        defaultValue="business@upi"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)]"
                        placeholder="e.g. name@okhdfcbank"
                    />
                    <button className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors text-sm font-medium">
                        Verify
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Kaisa will share this UPI ID with your guests for direct payments.</p>
            </div>
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
