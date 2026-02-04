
import { getInvestorStats, getInvestorProfile } from "@/app/actions/investor";
import { InvestorStats } from "@/components/investor/dashboard/InvestorStats";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";

export const metadata = {
  title: "Overview",
};

export default async function InvestorOverviewPage() {
  const stats = await getInvestorStats();
  const profile = await getInvestorProfile();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-zinc-400 mt-1">
            Welcome back, {profile?.legalName}. Here is your participation summary.
          </p>
        </div>
        <div className="flex gap-3">
             <Link 
                href="/node/dashboard/support"
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
             >
                Support
             </Link>
             <Link 
                href="/node/dashboard/nodes"
                className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2"
             >
                View My Nodes <ArrowRight className="w-4 h-4" />
             </Link>
        </div>
      </div>

      <InvestorStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participation Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-zinc-400" />
                Participation Status
            </h3>
            
            <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-zinc-800">
                    <span className="text-zinc-400">Account Status</span>
                    <span className="text-green-400 font-medium bg-green-900/20 px-2 py-1 rounded text-xs border border-green-900/50">ACTIVE</span>
                </div>
                <div className="flex justify-between py-3 border-b border-zinc-800">
                    <span className="text-zinc-400">KYC Verification</span>
                    <span className="text-white font-medium capitalize">{profile?.kycStatus}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-zinc-800">
                    <span className="text-zinc-400">Member Since</span>
                    <span className="text-white font-medium">{profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex justify-between py-3">
                    <span className="text-zinc-400">Total Unit Value</span>
                    <span className="text-white font-medium">₹{(stats.totalValue).toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>

        {/* Recent Activity / Updates Placeholder */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-center items-center text-center">
            <div className="p-3 bg-zinc-800 rounded-full mb-4">
                <Info className="w-6 h-6 text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">System Updates</h3>
            <p className="text-zinc-400 text-sm max-w-xs mb-6">
                No critical alerts or system notifications at this time. All Okhla nodes are operating normally.
            </p>
            <Link 
                href="/node/dashboard/reports" 
                className="text-cyan-400 text-sm font-medium hover:underline"
            >
                View Latest Reports
            </Link>
        </div>
      </div>
    </div>
  );
}
