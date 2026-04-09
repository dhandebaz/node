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
    <div className="bg-white border border-zinc-200 p-6 flex flex-col justify-between h-full rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 rounded-xl bg-zinc-50 text-blue-600 border border-zinc-100 shadow-sm group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${change >= 0 ? "text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full" : "text-rose-600 bg-rose-50 px-2 py-1 rounded-full"}`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-black text-zinc-950 mb-1 tracking-tighter">{value}</div>
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{title}</div>
        <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed font-medium italic">{description}</p>
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
    <div className="space-y-8 pb-32 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">Executive Analytics</h1>
          <p className="text-zinc-500 font-medium italic">Performance deep-dive and institutional ROI analysis.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-zinc-100/50 border border-zinc-200 rounded-xl flex p-1">
            {['today', '7d', '30d'].map((r) => (
              <Link
                key={r}
                href={`?range=${r}`}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  range === r ? "bg-white text-zinc-950 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-700 font-bold"
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
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-zinc-50/50 p-6 border-b border-zinc-100 flex justify-between items-center">
            <h2 className="text-base font-black text-zinc-950 uppercase tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Omni AI Capital Generation
            </h2>
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Efficiency Metrics</div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div>
                  <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-2">Automated Replies</div>
                  <div className="text-4xl font-black text-zinc-950 tracking-tighter">{aiRoi.aiRepliesSent}</div>
                  <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden mt-4 border border-zinc-200">
                     <div className="h-full rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]" style={{ width: '100%' }} />
                  </div>
               </div>
               <div>
                  <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-2">Conversion Rate</div>
                  <div className="text-4xl font-black text-zinc-950 tracking-tighter">
                     {aiRoi.aiRepliesSent ? Math.round((aiRoi.outcomes / aiRoi.aiRepliesSent) * 100) : 0}%
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden mt-4 border border-zinc-200">
                     <div className="h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${aiRoi.aiRepliesSent ? Math.min(100, (aiRoi.outcomes / aiRoi.aiRepliesSent) * 100) : 0}%` }} />
                  </div>
               </div>
               <div>
                  <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-2">Unit Cost (Outcome)</div>
                  <div className="text-4xl font-black text-zinc-950 tracking-tighter">
                     ₹{aiRoi.outcomes ? Math.round(aiRoi.creditsUsed / aiRoi.outcomes) : 0}
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden mt-4 border border-zinc-200">
                     <div className="h-full rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]" style={{ width: `${aiRoi.outcomes ? '100%' : '0%'}` }} />
                  </div>
               </div>
            </div>
            
            <div className="mt-12 p-6 bg-zinc-50 border border-zinc-100 rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
               <div className="flex items-center gap-4 relative">
                  <div className="p-3 bg-white border border-zinc-200 rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                     <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Yield Analysis</h3>
                     <p className="text-sm text-zinc-600 mt-1 font-medium italic">
                        Omni AI has yielded <span className="text-zinc-950 font-black">₹{Math.round(aiRoi.valueGenerated)}</span> in absolute value for an operational cost of <span className="text-zinc-950 font-black">₹{Math.round(aiRoi.creditsUsed)}</span>. 
                        Effective ROI: <span className="text-emerald-600 font-black">{aiRoi.creditsUsed ? Math.round((aiRoi.valueGenerated / aiRoi.creditsUsed) * 100) : 0}%</span>.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 border border-zinc-200 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black text-zinc-950 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Zap className="w-4 h-4 text-blue-600" />
                 Strategic Advisories
              </h3>
              <div className="space-y-4">
                 {[
                    { text: "Capital injection required to sustain AI operations during peak scaling.", action: "Optimize Billing", href: "/dashboard/billing" },
                    { text: "Channel integration protocol for Instagram DMs can yield +12% growth.", action: "Connect Link", href: "/dashboard/ai/integrations" },
                    { text: "Resource metadata refinement will improve associate accuracy.", action: "Manage Services", href: "/dashboard/ai/listings" }
                 ].map((rec, i) => (
                    <div key={i} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[10px] group cursor-pointer hover:bg-zinc-100 hover:border-zinc-200 transition-all">
                       <p className="text-zinc-500 font-black uppercase tracking-widest leading-relaxed group-hover:text-zinc-950">{rec.text}</p>
                       <Link href={rec.href} className="text-blue-600 font-black uppercase tracking-widest text-[10px] mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
