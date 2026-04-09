import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";
import { 
  Megaphone, 
  TrendingUp, 
  Users, 
  CreditCard,
  ArrowUpRight,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function MarketingDashboardPage() {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  // 1. Get Integration
  const { data: integration } = await supabase
    .from("integrations")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("provider", "meta")
    .maybeSingle();

  if (!integration) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh] bg-white border border-zinc-200 rounded-3xl shadow-sm">
        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100 mb-6 shadow-sm">
          <Megaphone className="w-10 h-10 text-zinc-300" />
        </div>
        <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tighter">Growth Engine Inactive</h2>
        <p className="text-zinc-500 max-w-sm mt-2 mb-8 text-sm font-medium italic leading-relaxed">
          Unlock high-fidelity Meta advertising. Connect your institutional Meta Business account to activate automated lead generation and campaign orchestration.
        </p>
        <Button asChild className="h-12 px-8 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <Link href="/dashboard/ai/integrations">
            Initialize Meta Protocol
          </Link>
        </Button>
      </div>
    );
  }

  // 2. Fetch Ad Account Info
  const meta = (integration.settings as any) || {};

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">Growth & Acquisition</h1>
          <p className="text-zinc-500 font-medium italic">Orchestrate Meta campaigns and analyze acquisition efficiency.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 px-4 rounded-xl border-zinc-200 bg-white text-zinc-950 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95 shadow-sm">
                <ExternalLink className="w-3 h-3 mr-2" />
                Ads Manager
            </Button>
            <Button className="h-10 px-6 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                Create Campaign
            </Button>
        </div>
      </header>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Absolute Reach", value: "12,402", trend: "+12%", icon: Users },
          { label: "Capital Deployed", value: "₹4,202", trend: "+5%", icon: CreditCard },
          { label: "Conversion Yield", value: "48", trend: "+24%", icon: TrendingUp },
          { label: "Interaction Rate", value: "12.4%", trend: "+1.2%", icon: ArrowUpRight },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-2.5 rounded-xl bg-zinc-50 text-blue-600 border border-zinc-100 shadow-sm group-hover:scale-110 transition-transform">
                <stat.icon className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-emerald-100 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {stat.trend}
              </Badge>
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-950 mb-1 tracking-tighter">{stat.value}</div>
              <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-relaxed">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign List */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-zinc-50/50 p-6 border-b border-zinc-100 flex justify-between items-center">
            <h2 className="text-base font-black text-zinc-950 uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Active Campaigns
            </h2>
          </div>
          <div className="p-12 text-center bg-zinc-50/30 mx-6 my-6 rounded-2xl border border-dashed border-zinc-200">
            <Megaphone className="w-10 h-10 mx-auto text-zinc-200 mb-4 opacity-50" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">No active orchestrations found.</p>
            <Button variant="link" size="sm" className="mt-4 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:text-blue-700">Configure Marketing Assets</Button>
          </div>
        </div>

        {/* Lead Performance */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-black text-zinc-950 uppercase tracking-tight mb-6">Institutional Leads</h3>
            <div className="space-y-4">
                {[
                    { name: "Suresh Kumar", source: "Asset Inquiries", time: "2h ago" },
                    { name: "Rahul Singh", source: "Capital Ad Form", time: "5h ago" },
                    { name: "Preeti Sahay", source: "Resource Inquiries", time: "1d ago" },
                ].map((lead, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50 group hover:bg-white hover:border-zinc-200 transition-all cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-blue-500/20">
                            {lead.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-black text-zinc-950 uppercase tracking-tight truncate">{lead.name}</div>
                            <div className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mt-0.5">{lead.source}</div>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{lead.time}</div>
                    </div>
                ))}
                
                <Button asChild variant="outline" className="w-full h-10 border-zinc-200 bg-white text-zinc-950 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95 shadow-sm mt-4">
                    <Link href="/dashboard/ai/customers?q=Meta">
                        View Intelligence Pool
                    </Link>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
