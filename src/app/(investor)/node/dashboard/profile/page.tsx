export const dynamic = 'force-dynamic';


import { getInvestorProfile } from "@/app/actions/investor";
import { User, Mail, Phone, ShieldCheck, Calendar, Lock } from "lucide-react";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const profile = await getInvestorProfile();

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-zinc-400" />
            Investor Profile
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage your personal details and view KYC status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details (Read-only mostly) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800 bg-zinc-950/30">
                <h3 className="font-bold text-white text-lg">Personal Information</h3>
            </div>
            <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-800 rounded-full">
                        <User className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Legal Name</label>
                        <div className="text-white font-medium text-lg">{profile.legalName}</div>
                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked per KYC
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-800 rounded-full">
                        <Mail className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Email Address</label>
                        <div className="text-white font-medium">{profile.email}</div>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-800 rounded-full">
                        <Phone className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Phone Number</label>
                        <div className="text-white font-medium">{profile.phone}</div>
                    </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-800">
                    <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                        Request Contact Update
                    </button>
                </div>
            </div>
        </div>

        {/* KYC & Account Status */}
        <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-zinc-800 bg-zinc-950/30">
                    <h3 className="font-bold text-white text-lg">Account Status</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-zinc-800 rounded-full">
                            <ShieldCheck className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">KYC Verification</label>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-medium capitalize">{profile.kycStatus}</span>
                                {profile.kycStatus === 'verified' && (
                                    <span className="bg-green-900/20 text-green-400 text-xs px-2 py-0.5 rounded border border-green-900/50">Verified</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-zinc-800 rounded-full">
                            <Calendar className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Participant Since</label>
                            <div className="text-white font-medium">
                                {new Date(profile.joinedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-6">
                <h4 className="text-blue-400 font-bold mb-2">Data Privacy</h4>
                <p className="text-sm text-blue-200/80 leading-relaxed">
                    Your data is stored securely and is only accessible to authorized Nodebase administrative staff for compliance and operational purposes. 
                    It is never shared with other participants or third parties without consent.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
