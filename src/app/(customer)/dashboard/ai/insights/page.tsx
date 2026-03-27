import { getActiveTenantId, getTenantContext } from "@/lib/auth/tenant";
import { AnalyticsService, TimeRange } from "@/lib/services/analyticsService";
import { InsightShareButton } from "@/components/dashboard/ai/InsightShareButton";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MessageSquare, 
  Calendar, 
  Zap,
  ShoppingBag,
  Stethoscope,
  Tags,
  ArrowRight,
  type LucideIcon
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  description: string;
  color: string;
}

function MetricCard({ title, value, change, icon: Icon, description, color }: MetricCardProps) {
  return (
    <div className="public-panel p-6 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 border border-white/10`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-bold ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-foreground mb-1 font-mono tracking-tight">{value}</div>
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</div>
        <p className="text-xs text-zinc-600 mt-2 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default async function AIInsightsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams;
  const range = (params.range as string || '7d') as TimeRange;
  const tenantId = await getActiveTenantId();
  if (!tenantId) redirect("/onboarding");
  
  const tenant = await getTenantContext(tenantId);
  const businessType = tenant?.businessType || 'airbnb_host';

  const [personaMetrics, aiRoi] = await Promise.all([
    AnalyticsService.getPersonaMetrics(tenantId, businessType, range),
    AnalyticsService.getAIROIMetrics(tenantId, range)
  ]);

  const getBusinessConfig = () => {
    switch(businessType) {
      case 'airbnb_host':
        return {
          title: "Property Insights",
          metrics: [
            { title: "Occupancy Rate", value: `${personaMetrics.occupancyRate}%`, icon: Calendar, description: "Listing availability vs bookings.", color: "blue" },
            { title: "Direct Bookings", value: personaMetrics.directBookings || 0, icon: Users, description: "Bookings via AI/Direct instead of OTAs.", color: "indigo" },
            { title: "Avg Response", value: `${personaMetrics.avgResponseTime || '< 2'}m`, icon: Zap, description: "How fast AI replies to your guests.", color: "amber" }
          ]
        };
      case 'kirana_store':
        return {
          title: "Store Performance",
          metrics: [
            { title: "Orders Count", value: personaMetrics.ordersCount || 0, icon: ShoppingBag, description: "Total orders processed via WhatsApp.", color: "green" },
            { title: "Repeat Customers", value: personaMetrics.repeatCustomers || 0, icon: Users, description: "Returning customers this month.", color: "emerald" },
            { title: "Avg Order Value", value: `₹${Math.round(personaMetrics.avgOrderValue || 0)}`, icon: DollarSign, description: "Median spend per customer order.", color: "blue" }
          ]
        };
      case 'doctor_clinic':
        return {
          title: "Clinic Operations",
          metrics: [
            { title: "Appointments", value: personaMetrics.appointmentsCount || 0, icon: Stethoscope, description: "Consultations scheduled via AI.", color: "red" },
            { title: "No-Show Rate", value: `${personaMetrics.noShowRate || 0}%`, icon: Users, description: "Confirmed guests who didn't arrive.", color: "rose" },
            { title: "Reminder Efficacy", value: `${personaMetrics.reminderEffectiveness || 0}%`, icon: Zap, description: "Percentage of no-shows prevented by AI.", color: "orange" }
          ]
        };
      case 'thrift_store':
        return {
          title: "Instagram Insights",
          metrics: [
            { title: "DMs Converted", value: personaMetrics.dmsConverted || 0, icon: MessageSquare, description: "DM inquiries turned into sales.", color: "purple" },
            { title: "Inventory Tags", value: 0, icon: Tags, description: "New items processed and tagged by AI.", color: "fuchsia" },
            { title: "Response Speed", value: personaMetrics.aiResponseSpeed ? `${personaMetrics.aiResponseSpeed}s` : "Instant", icon: Zap, description: "Average delay in DM responses.", color: "pink" }
          ]
        };
      default:
        return { title: "Business Insights", metrics: [] };
    }
  };

  const config = getBusinessConfig();

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">AI Insights</h1>
          <p className="text-muted-foreground">Deep dive into your business performance and AI ROI.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-panel border border-border rounded-lg flex p-1">
            {['today', '7d', '30d'].map((r) => (
              <Link
                key={r}
                href={`?range=${r}`}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  range === r ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </Link>
            ))}
          </div>
          <InsightShareButton 
            stats={{
              conversations: aiRoi.aiRepliesSent,
              value: Math.round(aiRoi.valueGenerated),
              period: range === '30d' ? 'month' : 'week'
            }} 
          />
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Net Revenue" 
          value={`₹${Math.round(personaMetrics.revenue || 0)}`} 
          icon={DollarSign} 
          description="Total income from all channels."
          color="emerald"
        />
        {config.metrics.map((m, i) => (
          <MetricCard key={i} {...m} />
        ))}
      </div>

      {/* AI ROI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 public-panel overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              AI Reply Value
            </h2>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Efficiency Multiplier</div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Replies Sent</div>
                  <div className="text-4xl font-bold text-foreground font-mono">{aiRoi.aiRepliesSent}</div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-4">
                     <div className="h-full rounded-full bg-primary" style={{ width: '100%' }} />
                  </div>
               </div>
               <div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Outcome Rate</div>
                  <div className="text-4xl font-bold text-foreground font-mono">
                     {aiRoi.aiRepliesSent ? Math.round((aiRoi.outcomes / aiRoi.aiRepliesSent) * 100) : 0}%
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-4">
                     <div className="h-full rounded-full bg-green-500" style={{ width: `${aiRoi.aiRepliesSent ? Math.min(100, (aiRoi.outcomes / aiRoi.aiRepliesSent) * 100) : 0}%` }} />
                  </div>
               </div>
               <div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Cost Per Outcome</div>
                  <div className="text-4xl font-bold text-foreground font-mono">
                     ₹{aiRoi.outcomes ? Math.round(aiRoi.creditsUsed / aiRoi.outcomes) : 0}
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-4">
                     <div className="h-full rounded-full bg-blue-500" style={{ width: `${aiRoi.outcomes ? '100%' : '0%'}` }} />
                  </div>
               </div>
            </div>
            
            <div className="mt-12 p-6 glass-panel rounded-xl">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-full">
                     <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                     <h3 className="font-bold text-foreground">AI Profitability</h3>
                     <p className="text-sm text-muted-foreground mt-1">
                        Kaisa has generated <span className="text-foreground font-bold">₹{Math.round(aiRoi.valueGenerated)}</span> in value for a cost of <span className="text-foreground font-bold">₹{Math.round(aiRoi.creditsUsed)}</span>. 
                        That&apos;s a <span className="text-emerald-400 font-bold">{aiRoi.creditsUsed ? Math.round((aiRoi.valueGenerated / aiRoi.creditsUsed) * 100) : 0}% ROI</span>.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="public-panel p-6 border border-white/5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                 <Zap className="w-4 h-4 text-primary" />
                 Smart Recommendations
              </h3>
              <div className="space-y-4">
                 {[
                    { text: "Increase credits to avoid AI pause during peak hours.", action: "Top Up", href: "/dashboard/billing" },
                    { text: "Connect Instagram DMs to improve conversion by 12%.", action: "Connect", href: "/dashboard/ai/integrations" },
                    { text: "Update listing photos to boost click-through rate.", action: "Edit", href: "/dashboard/ai/listings" }
                 ].map((rec, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl text-sm group cursor-pointer hover:bg-white/10 transition-all">
                       <p className="text-muted-foreground group-hover:text-zinc-200">{rec.text}</p>
                       <Link href={rec.href} className="text-primary font-bold uppercase tracking-wider text-[10px] mt-2 flex items-center gap-1">
                          {rec.action} <ArrowRight className="w-3 h-3" />
                       </Link>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
