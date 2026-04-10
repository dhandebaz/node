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
import { OmniCompanion } from "@/components/ui/OmniCompanion";

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
    <div className="card-chunky hover:-translate-y-1 group relative overflow-hidden h-full flex flex-col justify-between p-7">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl -z-10 rounded-full group-hover:bg-indigo-500/10 transition-colors" />
      
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border-b-4 border-indigo-200 shadow-sm transition-all group-hover:scale-110">
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${change >= 0 ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : "text-rose-700 bg-rose-50 border border-rose-100"}`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-4xl font-black text-slate-900 mb-1 tracking-tighter leading-none">{value}</div>
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</div>
        <p className="text-[10px] text-slate-500 mt-2 leading-snug font-bold italic">{description}</p>
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
    <div className="space-y-10 pb-32 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b-2 border-slate-100">
        <div className="flex items-start gap-8">
            <OmniCompanion 
                state="happy" 
                size="md" 
                bubbleText={`I've audited our neural Handshakes. Our performance is up ${Math.round((aiRoi.valueGenerated / Math.max(1, aiRoi.creditsUsed)) * 10)}% this ${range === '30d' ? 'month' : 'week'}!`}
            />
            <div className="pt-4">
                <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">Executive Analytics</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Neural ROI • Institutional Yield Audit</p>
            </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl flex p-1.5">
            {['today', '7d', '30d'].map((r) => (
              <Link
                key={r}
                href={`?range=${r}`}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  range === r ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100 border border-indigo-100" : "text-slate-400 hover:text-slate-600"
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
        <div className="lg:col-span-2 card-chunky overflow-hidden p-0 relative h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
            
          <div className="bg-slate-50/50 p-7 border-b-2 border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <Zap className="w-5 h-5 text-indigo-600 fill-current" />
              Omni AI Capital Generation
            </h2>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Yield Metrics</div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Automated Interactions</div>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{aiRoi.aiRepliesSent}</div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden mt-6 border-2 border-slate-200/50 p-[2px]">
                     <div className="h-full rounded-full bg-indigo-500 shadow-indigo-100 shadow-lg" style={{ width: '100%' }} />
                  </div>
               </div>
               <div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Response Precision</div>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                     {aiRoi.aiRepliesSent ? Math.round((aiRoi.outcomes / aiRoi.aiRepliesSent) * 100) : 0}%
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden mt-6 border-2 border-slate-200/50 p-[2px]">
                     <div className="h-full rounded-full bg-emerald-500 shadow-emerald-100 shadow-lg" style={{ width: `${aiRoi.aiRepliesSent ? Math.min(100, (aiRoi.outcomes / aiRoi.aiRepliesSent) * 100) : 0}%` }} />
                  </div>
               </div>
               <div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Unit Efficiency</div>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                     ₹{aiRoi.outcomes ? Math.round(aiRoi.creditsUsed / aiRoi.outcomes) : 0}
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden mt-6 border-2 border-slate-200/50 p-[2px]">
                     <div className="h-full rounded-full bg-indigo-300" style={{ width: `${aiRoi.outcomes ? '100%' : '0%'}` }} />
                  </div>
               </div>
            </div>
            
            <div className="mt-12 p-8 bg-indigo-50/50 border-2 border-indigo-100 rounded-[2rem] relative overflow-hidden group hover:border-indigo-200 transition-colors">
               <div className="flex items-center gap-6 relative">
                  <OmniCompanion state="success" size="md" className="shrink-0 scale-90" />
                  <div>
                     <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-900">Yield Audit Result</h3>
                     <p className="text-sm text-indigo-700/80 mt-2 font-bold leading-snug">
                        Omni AI has yielded <span className="text-indigo-900 font-black">₹{Math.round(aiRoi.valueGenerated)}</span> in absolute value for cost of <span className="text-indigo-900 font-black">₹{Math.round(aiRoi.creditsUsed)}</span>. 
                        Targeting <span className="text-emerald-600 font-black">ROI: {aiRoi.creditsUsed ? Math.round((aiRoi.valueGenerated / aiRoi.creditsUsed) * 100) : 0}%</span>.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-chunky p-7 h-full">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-7 flex items-center gap-3">
              <Zap className="w-4 h-4 text-indigo-600 fill-current" />
              Strategic Advisories
            </h3>
            <div className="space-y-4">
              {[
                { text: "Capital injection required to sustain AI operations during peak scaling.", action: "Optimize Billing", href: "/dashboard/billing" },
                { text: "Channel integration protocol for Instagram DMs can yield +12% growth.", action: "Connect Link", href: "/dashboard/ai/integrations" },
                { text: "Resource metadata refinement will improve associate accuracy.", action: "Manage Services", href: "/dashboard/ai/listings" }
              ].map((rec, i) => (
                <div key={i} className="p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] group cursor-pointer hover:border-indigo-100 hover:bg-indigo-50/20 transition-all">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed group-hover:text-slate-900 transition-colors">{rec.text}</p>
                  <Link href={rec.href} className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mt-4 flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform">
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
