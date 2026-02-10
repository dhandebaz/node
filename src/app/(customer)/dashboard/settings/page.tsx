export const dynamic = 'force-dynamic';

import { User, Bell, Shield, Smartphone, Monitor, CheckCircle2, AlertTriangle, FileCheck } from "lucide-react";
import { getCustomerProfile } from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function CustomerSettingsPage() {
  const profile = await getCustomerProfile();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-zinc-400">Manage your profile and preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
            <div className="p-3 bg-zinc-800 rounded-lg">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Profile</h2>
              <p className="text-sm text-zinc-400">Your personal information</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">User ID</label>
                <input 
                  type="text" 
                  value={profile.identity.id} 
                  readOnly
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 cursor-not-allowed opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Mobile Number (Primary)</label>
                 <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                    type="text" 
                    value={profile.identity.phone} 
                    readOnly
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 cursor-not-allowed opacity-70"
                    />
                 </div>
                 <p className="text-xs text-zinc-500 mt-1">Used for login and OTP.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Email (Optional)</label>
                <input 
                  type="email" 
                  value={profile.identity.email || ""} 
                  readOnly
                  placeholder="Not set"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 cursor-not-allowed opacity-70"
                />
              </div>
            </div>
          </div>
        </div>

        {/* KYC Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
            <div className="p-3 bg-zinc-800 rounded-lg">
              <FileCheck className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">KYC Verification</h2>
              <p className="text-sm text-zinc-400">Identity verification status</p>
            </div>
          </div>
          <div className="p-6">
             <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-full">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <div className="font-medium text-white">Pending Verification</div>
                        <div className="text-sm text-zinc-400">Please complete your KYC to unlock higher limits.</div>
                    </div>
                </div>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                    Start KYC
                </Button>
             </div>
             <div className="grid md:grid-cols-2 gap-4 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-zinc-700" />
                    <span>Aadhaar Verification</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-zinc-700" />
                    <span>PAN Card Verification</span>
                </div>
             </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
            <div className="p-3 bg-zinc-800 rounded-lg">
              <Bell className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              <p className="text-sm text-zinc-400">Manage how we contact you</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
              <div>
                <div className="font-medium text-white">Product Updates</div>
                <div className="text-sm text-zinc-400">Receive updates about your products</div>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 cursor-pointer">
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
              <div>
                <div className="font-medium text-white">Security Alerts</div>
                <div className="text-sm text-zinc-400">Login alerts and critical notifications</div>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 cursor-pointer opacity-50 cursor-not-allowed" title="Always enabled">
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
            <div className="p-3 bg-zinc-800 rounded-lg">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Security</h2>
              <p className="text-sm text-zinc-400">Manage your active sessions</p>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-zinc-400" />
                        <div>
                            <div className="font-medium text-white">Current Session</div>
                            <div className="text-sm text-zinc-400">Windows • Chrome • India</div>
                        </div>
                    </div>
                    <div className="text-xs text-green-400 font-medium px-2 py-1 bg-green-500/10 rounded">
                        Active Now
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-zinc-400" />
                        <div>
                            <div className="font-medium text-white">Mobile App</div>
                            <div className="text-sm text-zinc-400">iOS • iPhone 14 • India</div>
                        </div>
                    </div>
                    <button className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 hover:bg-red-500/10 rounded transition-colors">
                        Revoke
                    </button>
                 </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-zinc-800">
                <button className="text-red-400 hover:text-red-300 font-medium text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Log out of all devices
                </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
