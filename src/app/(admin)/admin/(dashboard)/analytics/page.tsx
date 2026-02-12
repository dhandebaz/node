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
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">System Analytics</h1>
        <p className="text-white/60">Platform health, usage, and revenue metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Tenants */}
        <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-white/40" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{health.activeTenants}</div>
            <p className="text-xs text-white/40 mt-1">Total registered businesses</p>
          </CardContent>
        </Card>

        {/* Credits Consumed (Today) */}
        <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Credits Consumed (24h)</CardTitle>
            <Zap className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{health.creditsConsumedToday.toFixed(2)}</div>
            <p className="text-xs text-white/40 mt-1">~{(health.creditsConsumedToday / 0.002).toFixed(0)} tokens</p>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{health.errorRate}%</div>
            <p className="text-xs text-white/40 mt-1">System-wide failures</p>
          </CardContent>
        </Card>

        {/* Integrations Health */}
        <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Integrations</CardTitle>
            <Server className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Healthy</div>
            <p className="text-xs text-white/40 mt-1">
               0 Disconnected / 0 Errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Growth & Referrals</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {/* New Tenants (24h) */}
          <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">New Tenants (24h)</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{health.growth?.newTenantsToday || 0}</div>
              <p className="text-xs text-white/40 mt-1">Signups in last 24 hours</p>
            </CardContent>
          </Card>

          {/* Total Referrals */}
          <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{health.growth?.totalReferrals || 0}</div>
              <p className="text-xs text-white/40 mt-1">Lifetime referral codes used</p>
            </CardContent>
          </Card>

          {/* Rewarded Referrals (Conversion) */}
          <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Rewarded Referrals</CardTitle>
              <Award className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{health.growth?.rewardedReferrals || 0}</div>
              <p className="text-xs text-white/40 mt-1">
                {health.growth?.totalReferrals ? (((health.growth?.rewardedReferrals || 0) / health.growth.totalReferrals) * 100).toFixed(1) : 0}% Conversion Rate
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Usage by Persona (Placeholder for MVP) */}
      <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">AI Usage by Persona</CardTitle>
          <CardDescription className="text-white/50">Distribution of AI activity across business types.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="h-[200px] flex items-center justify-center text-white/30 text-sm">
             (Chart: Airbnb Host vs Kirana Store vs Clinics)
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
