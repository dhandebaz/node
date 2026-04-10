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
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, timeAgo } from "@/lib/utils";
import { DashboardErrorBoundary } from "@/components/ui/ErrorBoundary";

// export const dynamic = "force-dynamic";

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
    { count: manualMessageCount },
    { count: integrationCount },
    { data: recentActivity },
    { data: accountData },
  ] = await Promise.all([
    WalletService.getBalance(tenantId),
    ControlService.getSystemFlags(),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("direction", "outbound")
      .eq("role", "assistant"),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("direction", "outbound")
      .eq("role", "human"),
    supabase
      .from("listing_integrations")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    supabase
      .from("audit_events")
      .select("id, event_type, actor_type, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("accounts")
      .select("onboarding_milestones")
      .eq("tenant_id", tenantId)
      .maybeSingle(),
  ]);


  const milestones = (accountData?.onboarding_milestones as string[]) || [];

  const isAiPaused =
    !tenant?.is_ai_enabled || flags["ai_global_enabled"] === false;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter mb-1">
            Executive Overview
          </h1>
          <p className="text-zinc-500 font-medium italic">
            Institutional control center for {tenant?.name}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all h-12 px-6">
            <Link href="/dashboard/ai/bookings/new">
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Link>
          </Button>
        </div>
      </div>

      <OnboardingChecklist
        stats={{
          listingCount: listingCount || 0,
          walletBalance: walletBalance || 0,
          isAiEnabled:
            !!tenant?.is_ai_enabled && flags["ai_global_enabled"] !== false,
          integrationCount: integrationCount || 0,
        }}
        milestones={milestones}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-xl hover:shadow-zinc-200/20 transition-all border-b-4 border-b-blue-600/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <Link
                href="/dashboard/billing"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                Refill <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-950 tracking-tighter mb-1">
                ₹{walletBalance}
              </div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Operational Capital
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-zinc-50 rounded-xl text-zinc-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <Link
                href="/dashboard/ai/inbox"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                Inbox <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-950 tracking-tighter mb-1">
                {manualMessageCount || 0}
              </div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Manual Replies
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-xl hover:shadow-zinc-200/20 transition-all border-b-4 border-b-blue-600">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <Link
                href="/dashboard/ai/activity"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                Log <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-950 tracking-tighter mb-1">
                {messageCount || 0}
              </div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Omni AI Automations
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-zinc-100 rounded-xl text-zinc-600">
                <Calendar className="w-5 h-5" />
              </div>
              <Link
                href="/dashboard/ai/bookings"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                View <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-950 tracking-tighter mb-1">
                {bookingCount || 0}
              </div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Active Leads
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Activity className="w-5 h-5" />
              </div>
              <Link
                href="/dashboard/ai/listings"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-950 tracking-tighter mb-1">
                {listingCount || 0}
              </div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Active Services
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <DashboardErrorBoundary>
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="bg-zinc-50/50 p-6 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-base font-black text-zinc-950 uppercase tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Operational Activity
              </h2>
            </div>
            <div className="p-0">
              {!recentActivity || recentActivity.length === 0 ? (
                <div className="p-12 text-center text-zinc-400 text-xs font-black uppercase tracking-widest italic leading-relaxed">
                  No institutional logs recorded.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {recentActivity.map((activity: any) => {
                      const eventType = String(activity.event_type ?? "");
                      const actorType = String(activity.actor_type ?? "");
                      const createdAt = activity?.created_at
                        ? timeAgo(activity.created_at)
                        : "";
                      const isError =
                        eventType.includes("ERROR") ||
                        eventType.includes("BLOCKED");
                      const isAiEvent = eventType.includes("AI");

                      return (
                        <div
                          key={activity.id}
                          className="p-5 flex items-center gap-5 hover:bg-zinc-50 transition-colors group cursor-pointer"
                        >
                          <div
                            className={`p-2.5 rounded-xl border shadow-sm transition-transform group-hover:scale-110 ${isError ? "bg-rose-50 border-rose-100 text-rose-600" : isAiEvent ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-zinc-50 border-zinc-100 text-zinc-400"}`}
                          >
                            {isError ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : isAiEvent ? (
                              <Zap className="w-4 h-4" />
                            ) : (
                              <Activity className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-zinc-950 font-black uppercase tracking-tight truncate flex items-center gap-2">
                              {eventType.replace(/_/g, " ")}
                            </div>
                            <div className="text-[10px] text-zinc-400 uppercase font-black tracking-widest truncate mt-1">
                              {createdAt}
                              {createdAt && actorType ? " • " : ""}
                              {actorType}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </div>
        </DashboardErrorBoundary>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          <DashboardErrorBoundary>
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden">
              <h3 className="text-base font-black text-zinc-950 uppercase tracking-tight mb-6">Omni AI Protocol</h3>
              <div>
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-4 mb-6 transition-colors ${
                    isAiPaused
                      ? "bg-rose-50 border-rose-100"
                      : "bg-emerald-50 border-emerald-100"
                  }`}
                >
                  <div className={cn(
                    "p-2 rounded-xl border shadow-sm",
                    isAiPaused ? "bg-white border-rose-200 text-rose-600" : "bg-white border-emerald-200 text-emerald-600"
                  )}>
                    {isAiPaused ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest leading-none mb-1",
                        isAiPaused ? "text-rose-600" : "text-emerald-600"
                      )}
                    >
                      {isAiPaused ? "Neural Engine Paused" : "Neural Engine Active"}
                    </div>
                    <p className="text-[10px] text-zinc-500 font-bold italic leading-relaxed">
                      {isAiPaused
                        ? "Institutional response core is currently inactive. Client inquiries pending."
                        : "AI is synchronizing with inbox and orchestrating responses."}
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full h-11 border-zinc-200 bg-white text-zinc-950 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95 shadow-sm"
                >
                  <Link href="/dashboard/ai/settings">
                    Configure Neural Core
                  </Link>
                </Button>
              </div>
            </div>
          </DashboardErrorBoundary>

          <DashboardErrorBoundary>
            <div className="bg-blue-600 border border-blue-500 rounded-3xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="p-8 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight">Expansion Protocol</h3>
                </div>
                <p className="text-xs text-blue-50/80 mb-8 font-medium italic leading-relaxed">
                  Yield <span className="text-white font-black">₹500</span> in operational credits for every institution you onboard to Omni AI.
                </p>
                <Button
                  asChild
                  className="w-full h-11 bg-white text-blue-600 hover:bg-zinc-50 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg transition-all active:scale-95 border-none"
                >
                  <Link href="/dashboard/invite">Activate Invitation</Link>
                </Button>
              </div>
            </div>
          </DashboardErrorBoundary>
        </div>
      </div>
    </div>
  );
}
