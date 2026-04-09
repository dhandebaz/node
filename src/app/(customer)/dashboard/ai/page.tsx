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
import { timeAgo } from "@/lib/utils";
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {tenant?.name}. Here&apos;s what&apos;s happening.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="font-bold">
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
        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <Link
                href="/dashboard/billing"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                Top Up <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-950 tracking-tighter mb-1">
                ₹{walletBalance}
              </div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Wallet Balance
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

        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
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
                AI Automations
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
          <Card className="lg:col-span-2 glass-card p-0 border-none shadow-none overflow-hidden">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Activity className="w-5 h-5 text-muted-foreground" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!recentActivity || recentActivity.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No recent activity recorded.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
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
                          className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className={`p-2.5 rounded-full ${isError ? "bg-red-500/10 text-red-400" : isAiEvent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
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
                            <div className="text-sm text-foreground font-medium truncate flex items-center gap-2">
                              {eventType.replace(/_/g, " ")}
                            </div>
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
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
            </CardContent>
          </Card>
        </DashboardErrorBoundary>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          <DashboardErrorBoundary>
            <Card className="glass-card p-0 border-none shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground">AI Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`p-4 rounded-lg border flex items-start gap-3 mb-6 ${
                    isAiPaused
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-green-500/5 border-green-500/20"
                  }`}
                >
                  {isAiPaused ? (
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  ) : (
                    <Zap className="w-5 h-5 text-green-400 mt-0.5" />
                  )}
                  <div>
                    <div
                      className={`font-semibold text-sm ${isAiPaused ? "text-red-400" : "text-green-400"}`}
                    >
                      {isAiPaused ? "AI is Paused" : "AI is Active"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {isAiPaused
                        ? "Your AI is currently not replying to incoming messages. Check your settings."
                        : "Your AI is monitoring your inbox 24/7 and responding to clients."}
                    </p>
                  </div>
                </div>
 
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/dashboard/ai/settings">
                    Configure AI Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>

          </DashboardErrorBoundary>

          <DashboardErrorBoundary>
            <Card className="bg-primary border-0 text-white relative overflow-hidden">
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-white/90" />
                  <h3 className="font-bold text-lg">Refer & Earn</h3>
                </div>
                <p className="text-sm text-white/80 mb-6 leading-relaxed">
                  Get ₹500 in free AI credits for every friend you invite to the
                  platform.
                </p>
                <Button
                  asChild
                  className="w-full bg-white text-primary hover:bg-white/90 font-bold"
                >
                  <Link href="/dashboard/invite">Invite Friends</Link>
                </Button>
              </CardContent>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-xl" />
            </Card>
          </DashboardErrorBoundary>
        </div>
      </div>
    </div>
  );
}
