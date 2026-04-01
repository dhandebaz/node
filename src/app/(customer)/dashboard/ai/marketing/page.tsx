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
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh] glass-card">
        <Megaphone className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-foreground">Marketing Suite</h2>
        <p className="text-muted-foreground max-w-sm mt-2 mb-6 text-sm leading-relaxed">
          Unlock powerful Facebook and Instagram advertising. 
          Connect your Meta Business account to start managing campaigns and leads.
        </p>
        <Button asChild className="font-bold">
          <Link href="/dashboard/ai/integrations">
            Connect Meta
          </Link>
        </Button>
      </div>
    );
  }

  // 2. Fetch Ad Account Info
  const meta = (integration.settings as any) || {};

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-primary" />
            Marketing
          </h1>
          <p className="text-muted-foreground mt-1">
            Build and optimize your Meta Ad campaigns directly from Nodebase.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="font-bold">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ads Manager
            </Button>
            <Button className="font-bold">
                Create Campaign
            </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reach", value: "12,402", trend: "+12%", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Ad Spend", value: "₹4,200", trend: "+5%", icon: CreditCard, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "New Leads", value: "48", trend: "+24%", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "CTR", value: "12.4%", trend: "+1.2%", icon: ArrowUpRight, color: "text-orange-400", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-none shadow-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 ${stat.bg} rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-green-500/30 text-green-400">
                  {stat.trend}
                </Badge>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign List */}
        <Card className="lg:col-span-2 glass-card border-none shadow-none overflow-hidden pb-4">
          <CardHeader className="border-b border-border mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="p-8 text-center bg-muted/20 mx-4 rounded-xl border border-dashed border-border mb-4">
                <Megaphone className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-30" />
                <p className="text-sm font-medium text-muted-foreground">Select an Ad Account to view campaigns.</p>
                <Button variant="link" size="sm" className="mt-2 text-primary font-bold">Configure Marketing account</Button>
             </div>
          </CardContent>
        </Card>

        {/* Lead Performance */}
        <Card className="glass-card border-none shadow-none">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Recent Meta Leads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {[
                    { name: "Suresh Kumar", source: "Property Inquiries", time: "2h ago" },
                    { name: "Rahul Singh", source: "Main Ad Form", time: "5h ago" },
                    { name: "Preeti Sahay", source: "Property Inquiries", time: "1d ago" },
                ].map((lead, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                            {lead.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-foreground truncate">{lead.name}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{lead.source}</div>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium">{lead.time}</div>
                    </div>
                ))}
                
                <Button asChild variant="outline" className="w-full font-bold">
                    <Link href="/dashboard/ai/customers?q=Meta">
                        View All Leads
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
