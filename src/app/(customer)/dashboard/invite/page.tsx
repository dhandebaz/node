import { requireActiveTenant, getTenantContext } from "@/lib/auth/tenant";
import { ReferralService } from "@/lib/services/referralService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Gift, MessageCircle, Mail, Users, CheckCircle } from "lucide-react";
import { InviteCopyButton } from "@/components/dashboard/invite/InviteCopyButton"; // Client component for copy interaction

export default async function InvitePage() {
  const tenantId = await requireActiveTenant();
  const tenant = await getTenantContext(tenantId);
  
  // Ensure code exists
  const referralCode = await ReferralService.getReferralCode(tenantId);
  const stats = await ReferralService.getReferralStats(tenantId);
  
  const referralLink = `https://nodebase.ai/signup?ref=${referralCode}`;
  
  // WhatsApp Message
  const waText = `Hey, I’m using Nodebase to manage my business with AI. It’s saving me time and helping with bookings. Thought you might find it useful. Try it here: ${referralLink}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;
  
  // Email Subject/Body
  const mailSubject = "Try Nodebase AI";
  const mailBody = waText;
  const mailUrl = `mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Invite & Earn</h1>
        <p className="text-white/60">Help other businesses discover Nodebase and earn AI credits.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Invite Card */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-black border-purple-500/20 md:col-span-2">
          <CardHeader>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-white">Give 500, Get 500</CardTitle>
                  <CardDescription className="text-white/50">
                    Refer a business owner. When they become active, you both get 500 AI credits (₹100 value).
                  </CardDescription>
                </div>
             </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Link Copy */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Your Referral Link</label>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={referralLink} 
                  className="bg-black/50 border-white/10 text-white font-mono text-sm"
                />
                <InviteCopyButton text={referralLink} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <a 
                href={waUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-lg transition-colors group"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span className="text-[#25D366] font-medium">WhatsApp</span>
              </a>
              
              <a 
                href={mailUrl}
                className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Email</span>
              </a>
            </div>

          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalEarned} <span className="text-sm font-normal text-white/40">credits</span></div>
            <p className="text-xs text-white/40 mt-1">Lifetime rewards</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Invites Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalInvited}</div>
            <p className="text-xs text-white/40 mt-1">{stats.pending} pending activation</p>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.history.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm">
              No referrals yet. Invite your first friend!
            </div>
          ) : (
            <div className="space-y-4">
              {stats.history.map((referral: any) => (
                <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${referral.status === 'rewarded' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {referral.status === 'rewarded' ? <CheckCircle className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white capitalize">{referral.status}</div>
                      <div className="text-xs text-white/40">{new Date(referral.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {referral.status === 'rewarded' && (
                    <div className="text-sm font-bold text-green-400">+{referral.reward_amount} Cr</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
