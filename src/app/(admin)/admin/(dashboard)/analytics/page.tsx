import { AnalyticsService } from "@/lib/services/analyticsService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Activity, 
  Users, 
  Zap, 
  AlertTriangle, 
  Server,
  TrendingUp,
  CheckCircle,
  CreditCard,
  DollarSign,
  Award
} from "lucide-react";

export default async function AdminAnalyticsPage() {
  const health = await AnalyticsService.getAdminSystemHealth();

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Neural <span className="text-primary/40">Analytics</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Real-time platform health & revenue intelligence
          </p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 px-6 py-4 rounded-2xl border border-border shadow-inner group transition-all hover:bg-muted/50">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Live Feed Active</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Active Tenants</span>
            <Users className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-4xl font-black text-foreground tracking-tighter mb-2">{health.activeTenants}</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Total registered businesses</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm transition-all hover:shadow-md hover:border-accent/20 group">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Credits Consumed (24h)</span>
            <Zap className="h-4 w-4 text-accent/40 group-hover:text-accent transition-colors" />
          </div>
          <div className="text-4xl font-black text-foreground tracking-tighter mb-2">{health.creditsConsumedToday.toFixed(2)}</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">~{(health.creditsConsumedToday / 0.002).toFixed(0)} tokens</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm transition-all hover:shadow-md hover:border-destructive/20 group">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Error Rate</span>
            <AlertTriangle className="h-4 w-4 text-destructive/40 group-hover:text-destructive transition-colors" />
          </div>
          <div className="text-4xl font-black text-foreground tracking-tighter mb-2">{health.errorRate}%</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">System-wide failures</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm transition-all hover:shadow-md hover:border-success/20 group">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Integrations</span>
            <Server className="h-4 w-4 text-success/40 group-hover:text-success transition-colors" />
          </div>
          <div className="text-4xl font-black text-foreground tracking-tighter mb-2">Healthy</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">0 Disconnected / 0 Errors</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 ml-2">Growth & Conversion</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm transition-all hover:shadow-md hover:border-success/20 group">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">New Tenants (24h)</span>
              <TrendingUp className="h-4 w-4 text-success/40 group-hover:text-success transition-colors" />
            </div>
            <div className="text-4xl font-black text-foreground tracking-tighter mb-2">{health.growth?.newTenantsToday || 0}</div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Signups in last 24 hours</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Total Referrals</span>
              <Users className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
            </div>
            <div className="text-4xl font-black text-foreground tracking-tighter mb-2">{health.growth?.totalReferrals || 0}</div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Lifetime referral codes used</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm transition-all hover:shadow-md hover:border-warning/20 group">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Rewarded Referrals</span>
              <Award className="h-4 w-4 text-warning/40 group-hover:text-warning transition-colors" />
            </div>
            <div className="text-4xl font-black text-foreground tracking-tighter mb-2">{health.growth?.rewardedReferrals || 0}</div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
              {health.growth?.totalReferrals ? (((health.growth?.rewardedReferrals || 0) / health.growth.totalReferrals) * 100).toFixed(1) : 0}% Conversion Rate
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-10 shadow-sm group">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">AI Usage by Persona</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Distribution of neural activity across business domains</p>
          </div>
          <div className="px-4 py-2 bg-muted/30 rounded-full border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-foreground transition-colors">
            Aggregate Visual
          </div>
        </div>
        <div className="h-[240px] flex items-center justify-center bg-muted/10 rounded-2xl border border-dashed border-border/60 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic shadow-inner">
          Neural Distribution Cluster Map
        </div>
      </div>
    </div>
  );
}
