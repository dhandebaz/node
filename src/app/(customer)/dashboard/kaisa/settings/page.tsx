
import { getKaisaDashboardData } from "@/app/actions/customer";
import { 
  CreditCard, 
  QrCode, 
  Settings, 
  Shield, 
  Zap,
  IndianRupee
} from "lucide-react";

export default async function KaisaSettingsPage() {
  const data = await getKaisaDashboardData();
  const { profile, credits } = data;

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-zinc-400">Manage your plan, billing, and payment collection preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Plan Details */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-saffron/10 rounded-lg text-brand-saffron">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Plan Details</h2>
              <p className="text-sm text-zinc-500">Your current subscription tier</p>
            </div>
          </div>
          
          <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-400 mb-1">Current Plan</div>
              <div className="text-xl font-bold text-white capitalize">{profile.role} Plan</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              profile.status === "active" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
            }`}>
              {profile.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Kaisa Billing (Payment Details) */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Billing & Payments</h2>
              <p className="text-sm text-zinc-500">Payment method for Kaisa AI services</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-zinc-700 rounded flex items-center justify-center text-[10px] font-bold text-zinc-300">
                        VISA
                    </div>
                    <div>
                        <div className="text-white font-medium">•••• •••• •••• 4242</div>
                        <div className="text-xs text-zinc-500">Expires 12/28</div>
                    </div>
                </div>
                <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
            </div>
            
            <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Wage Balance</span>
                <span className="text-white font-mono">₹{credits.balance}</span>
            </div>
          </div>
        </div>

        {/* Payment Collection (UPI/QR) */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Payment Collection</h2>
              <p className="text-sm text-zinc-500">Receive payments from your customers via UPI</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Your UPI ID (VPA)</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        defaultValue="business@upi"
                        className="flex-1 bg-black/40 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-saffron transition-colors"
                        placeholder="e.g. name@okhdfcbank"
                    />
                    <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium">
                        Verify
                    </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Kaisa will share this UPI ID with your customers for direct payments.</p>
            </div>

            <div className="p-4 bg-black/40 rounded-lg border border-zinc-800 flex items-start gap-4">
                <div className="w-24 h-24 bg-white p-2 rounded flex items-center justify-center">
                    <QrCode className="w-full h-full text-black" />
                </div>
                <div>
                    <h3 className="text-white font-medium mb-1">Generated QR Code</h3>
                    <p className="text-sm text-zinc-400 mb-3">This QR code is generated based on your UPI ID.</p>
                    <div className="flex gap-3">
                        <button className="text-xs text-brand-saffron hover:text-brand-saffron/80 flex items-center gap-1">
                            Download
                        </button>
                        <button className="text-xs text-zinc-400 hover:text-white">
                            Regenerate
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
