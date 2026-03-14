import { getActiveTenantId, getTenantContext } from "@/lib/auth/tenant";
import { WalletService } from "@/lib/services/walletService";
import { ControlService } from "@/lib/services/controlService";
import { getSupabaseServer } from "@/lib/supabase/server";
import { 
  CreditCard, 
  MessageSquare, 
  Home, 
  Calendar, 
  Activity, 
  Plus,
  AlertTriangle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";

export const dynamic = 'force-dynamic';

export default async function AIDashboardPage() {
  const tenantId = await getActiveTenantId();
  if (!tenantId) redirect("/onboarding");
  const tenant = await getTenantContext(tenantId);
  const supabase = await getSupabaseServer();

  // Parallel Data Fetching
  const [
    walletBalance,
    flags,
    { count: listingCount },
    { count: bookingCount },
    { count: messageCount },
    { count: integrationCount },
    { data: recentActivity },
    { data: accountData }
  ] = await Promise.all([
    WalletService.getBalance(tenantId),
    ControlService.getSystemFlags(),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('direction', 'outbound'),
    supabase.from('listing_integrations').select('*', { count: 'exact', head: true }).in('listing_id', (await supabase.from('listings').select('id').eq('tenant_id', tenantId)).data?.map(l => l.id) || []),
    supabase.from('audit_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('accounts').select('onboarding_milestones').eq('tenant_id', tenantId).maybeSingle()
  ]);

  const milestones = (accountData?.onboarding_milestones as string[]) || [];

  const isAiPaused = !tenant?.is_ai_enabled || flags['ai_global_enabled'] === false;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Overview</h1>
          <p className="text-zinc-400">Welcome back, {tenant?.name}. Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex items-center gap-3">
            <Link 
                href="/dashboard/ai/bookings/new"
                className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                New Booking
            </Link>
        </div>
      </div>

      <OnboardingChecklist 
        stats={{
          listingCount: listingCount || 0,
          walletBalance: walletBalance || 0,
          isAiEnabled: !!tenant?.is_ai_enabled && flags['ai_global_enabled'] !== false,
          integrationCount: integrationCount || 0
        }}
        milestones={milestones}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <CreditCard className="w-5 h-5" />
                </div>
                <Link href="/dashboard/billing" className="text-xs text-zinc-500 hover:text-white">Top Up</Link>
            </div>
            <div>
                <div className="text-2xl font-bold text-white mb-1">₹{walletBalance}</div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Wallet Balance</div>
            </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <Link href="/dashboard/ai/activity" className="text-xs text-zinc-500 hover:text-white">View Log</Link>
            </div>
            <div>
                <div className="text-2xl font-bold text-white mb-1">{messageCount || 0}</div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">AI Replies Sent</div>
            </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Calendar className="w-5 h-5" />
                </div>
                <Link href="/dashboard/ai/bookings" className="text-xs text-zinc-500 hover:text-white">View All</Link>
            </div>
            <div>
                <div className="text-2xl font-bold text-white mb-1">{bookingCount || 0}</div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Total Bookings</div>
            </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                    <Home className="w-5 h-5" />
                </div>
                <Link href="/dashboard/ai/listings" className="text-xs text-zinc-500 hover:text-white">Manage</Link>
            </div>
            <div>
                <div className="text-2xl font-bold text-white mb-1">{listingCount || 0}</div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Active Listings</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-zinc-500" />
                    Recent Activity
                </h3>
            </div>
            <div className="p-0">
                {(!recentActivity || recentActivity.length === 0) ? (
                    <div className="p-8 text-center text-zinc-500 text-sm">
                        No recent activity recorded.
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-800/50">
                        {recentActivity.map((activity: { id: string; event_type?: string; actor_type?: string; created_at?: string }) => {
                          const eventType = String(activity?.event_type ?? "");
                          const actorType = String(activity?.actor_type ?? "");
                          const createdAt = activity?.created_at ? new Date(activity.created_at).toLocaleString() : "";
                          const isError = eventType.includes("ERROR") || eventType.includes("BLOCKED");
                          const isAiEvent = eventType.includes("AI");

                          return (
                            <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-zinc-800/20 transition-colors">
                              <div className={`p-2 rounded-full ${isError ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-400"}`}>
                                {isAiEvent ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white font-medium truncate">
                                  {eventType.replace(/_/g, " ")}
                                </div>
                                <div className="text-xs text-zinc-500 truncate">
                                  {createdAt}{createdAt && actorType ? " • " : ""}{actorType}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                )}
            </div>
        </div>

        {/* Status Card */}
        <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="font-bold text-white mb-4">AI Status</h3>
                <div className={`p-4 rounded-lg border flex items-start gap-3 mb-4 ${
                    isAiPaused 
                        ? 'bg-red-500/10 border-red-500/20' 
                        : 'bg-green-500/10 border-green-500/20'
                }`}>
                    {isAiPaused ? (
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                    ) : (
                        <Zap className="w-5 h-5 text-green-400 mt-0.5" />
                    )}
                    <div>
                        <div className={`font-bold text-sm ${isAiPaused ? 'text-red-400' : 'text-green-400'}`}>
                            {isAiPaused ? 'AI Paused' : 'AI Active'}
                        </div>
                        <p className="text-xs opacity-70 mt-1">
                            {isAiPaused 
                                ? 'Your AI is currently not replying to messages.' 
                                : 'Your AI is monitoring your inbox 24/7.'}
                        </p>
                    </div>
                </div>
                
                <Link 
                    href="/dashboard/ai/settings"
                    className="block w-full py-2 text-center text-xs font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                    Configure AI
                </Link>
            </div>

            <div className="bg-gradient-to-br from-brand-red to-brand-deep-red rounded-xl p-5 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-1">Refer & Earn</h3>
                    <p className="text-sm text-white/80 mb-4">Get ₹500 credits for every friend you invite.</p>
                    <Link 
                        href="/dashboard/invite"
                        className="inline-block px-4 py-2 bg-white text-brand-red font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-white/90"
                    >
                        Invite Friends
                    </Link>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            </div>
        </div>
      </div>
    </div>
  );
}
