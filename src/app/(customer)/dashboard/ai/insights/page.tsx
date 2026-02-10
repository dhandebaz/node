import { requireActiveTenant, getTenantContext } from "@/lib/auth/tenant";
import { AnalyticsService, TimeRange } from "@/lib/services/analyticsService";
import { ReferralService } from "@/lib/services/referralService"; // Import Service
import { InsightShareButton } from "@/components/dashboard/ai/InsightShareButton"; // Import Component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MessageSquare, 
  Calendar, 
  Zap,
  ShoppingBag
} from "lucide-react";

export default async function AIInsightsPage() {
  const tenantId = await requireActiveTenant();
  const tenant = await getTenantContext(tenantId);
  const businessType = tenant?.businessType || 'airbnb_host';

  // Fetch Data (Parallel)
  const [metricsToday, metrics7d, metrics30d, roi30d, referralCode] = await Promise.all([
    AnalyticsService.getPersonaMetrics(tenantId, businessType, 'today'),
    AnalyticsService.getPersonaMetrics(tenantId, businessType, '7d'),
    AnalyticsService.getPersonaMetrics(tenantId, businessType, '30d'),
    AnalyticsService.getAIROIMetrics(tenantId, '30d'),
    ReferralService.getReferralCode(tenantId)
  ]);

  // Helper to get icon based on business type
  const getIcon = () => {
    switch(businessType) {
      case 'kirana_store': return ShoppingBag;
      case 'doctor_clinic': return Calendar;
      default: return Users;
    }
  };

  const BusinessIcon = getIcon();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">AI Insights & ROI</h1>
        <p className="text-white/60">Real impact of your AI Employee on your business.</p>
      </div>

      {/* ROI Section (Key) */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-black border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-white">AI Value Generated (Last 30 Days)</CardTitle>
                <CardDescription className="text-white/50">
                  Net gain from AI-assisted outcomes vs. credit costs.
                </CardDescription>
              </div>
            </div>
            <InsightShareButton 
              stats={{
                conversations: roi30d.aiRepliesSent,
                value: roi30d.valueGenerated,
                period: 'month'
              }}
              referralCode={referralCode || undefined}
            />
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-1">
                <div className="text-sm text-white/50">Value Generated</div>
                <div className="text-3xl font-bold text-green-400">
                    ₹{roi30d.valueGenerated.toLocaleString()}
                </div>
                <div className="text-xs text-white/40">
                    From {roi30d.outcomes} AI-assisted bookings/orders
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-sm text-white/50">Cost (Credits)</div>
                <div className="text-3xl font-bold text-white">
                    ₹{roi30d.costIncurred.toFixed(2)}
                </div>
                <div className="text-xs text-white/40">
                    {roi30d.aiRepliesSent} replies sent
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-sm text-white/50">Net ROI</div>
                <div className="text-3xl font-bold text-purple-400">
                    {roi30d.netGain > 0 ? '+' : ''}₹{roi30d.netGain.toLocaleString()}
                </div>
                <div className="text-xs text-white/40">
                    Profit after AI costs
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Persona Metrics */}
      <Tabs defaultValue="30d" className="space-y-4">
        <TabsList className="bg-black/20 border border-white/10">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
        </TabsList>

        {['today', '7d', '30d'].map((range) => {
           const data = range === 'today' ? metricsToday : range === '7d' ? metrics7d : metrics30d;
           const insightText = generateInsight(businessType, data, roi30d);
           
           return (
             <TabsContent key={range} value={range} className="space-y-4">
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 
                 {/* Dynamic Metrics based on Persona */}
                 {businessType === 'airbnb_host' && (
                   <>
                     <MetricCard title="Revenue" value={`₹${data.revenue?.toLocaleString()}`} icon={DollarSign} />
                     <MetricCard title="Direct Bookings" value={data.directBookings} subtext="vs OTA" icon={Users} />
                     <MetricCard title="AI-Assisted" value={data.aiAssistedBookings} subtext="Bookings converted" icon={Zap} />
                     {/* Occupancy hard to calc, maybe show simple count */}
                     <MetricCard title="Total Bookings" value={data.directBookings! + (data.otaBookings || 0)} icon={Calendar} />
                   </>
                 )}

                 {businessType === 'kirana_store' && (
                   <>
                     <MetricCard title="Revenue" value={`₹${data.revenue?.toLocaleString()}`} icon={DollarSign} />
                     <MetricCard title="Orders" value={data.ordersCount} icon={ShoppingBag} />
                     <MetricCard title="Avg Order Value" value={`₹${Math.round(data.avgOrderValue || 0)}`} icon={TrendingUp} />
                     <MetricCard title="AI Handled" value={data.aiHandledOrders} subtext="Orders" icon={Zap} />
                   </>
                 )}
                 
                 {/* Fallback for others */}
                 {!['airbnb_host', 'kirana_store'].includes(businessType) && (
                    <>
                     <MetricCard title="Revenue" value={`₹${data.revenue?.toLocaleString()}`} icon={DollarSign} />
                     <MetricCard title="Interactions" value={roi30d.aiRepliesSent} icon={MessageSquare} />
                    </>
                 )}

               </div>
               
               {/* Insight Text */}
               <Card className="bg-blue-500/5 border-blue-500/20">
                 <CardContent className="pt-6 flex items-start gap-4">
                   <div className="p-2 bg-blue-500/20 rounded-full text-blue-400 mt-1">
                     <Zap className="w-4 h-4" />
                   </div>
                   <div className="flex-1">
                     <h3 className="text-blue-400 font-medium mb-1">AI Insight</h3>
                     <p className="text-white/80 text-sm">
                       {insightText}
                     </p>
                   </div>
                   <InsightShareButton text={insightText} referralCode={referralCode} />
                 </CardContent>
               </Card>

             </TabsContent>
           );
        })}
      </Tabs>
    </div>
  );
}

function MetricCard({ title, value, subtext, icon: Icon }: any) {
  return (
    <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/70">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-white/40" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value ?? 0}</div>
        {subtext && <p className="text-xs text-white/40 mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  );
}

function generateInsight(type: string, metrics: any, roi: any) {
  if (type === 'airbnb_host') {
    return `AI helped convert ${metrics.aiAssistedBookings || 0} direct bookings worth ₹${((metrics.revenue || 0) * 0.2).toLocaleString()} (est) this period.`;
  }
  if (type === 'kirana_store') {
    return `AI handled ${(metrics.aiHandledOrders || 0)} customer queries, saving approx ${(metrics.aiHandledOrders || 0) * 5} minutes.`;
  }
  return `AI generated ${roi.outcomes} outcomes with a net gain of ₹${roi.netGain.toLocaleString()}.`;
}
