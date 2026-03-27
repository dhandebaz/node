
"use client";

import { useEffect, useState } from "react";
import { 
  Rocket, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Loader2,
  Calendar,
  User,
  Zap,
  Sparkles
} from "lucide-react";
import { getGrowthDataAction, scanForOpportunitiesAction, approveLeadAction } from "@/app/actions/growth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GrowthPage() {
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [data, setData] = useState<any>({ campaigns: [], opportunities: [] });

  const fetchData = async () => {
    try {
      const result = await getGrowthDataAction();
      setData(result);
    } catch (e) {
      toast.error("Failed to load growth data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await scanForOpportunitiesAction();
      if (result.count > 0) {
        toast.success(`Found ${result.count} new opportunities!`);
        fetchData();
      } else {
        toast.info("No new availability gaps detected for now.");
      }
    } catch (e) {
      toast.error("Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveLeadAction(id);
      toast.success("Message sent successfully!");
      fetchData();
    } catch (e) {
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/40" />
        <p className="text-foreground/40 text-sm">Loading Kaisa's Growth Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground uppercase tracking-tight flex items-center gap-3">
            <Rocket className="text-orange-500 w-8 h-8" />
            Autonomous Growth
          </h1>
          <p className="text-foreground/50 text-sm">
            Kaisa proactively finds gaps in your calendar and reaches out to potential leads.
          </p>
        </div>
        <Button 
          onClick={handleScan} 
          disabled={scanning}
          className="bg-orange-500 hover:bg-orange-600 text-foreground font-bold px-6 rounded-full"
        >
          {scanning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
          Scan for Gaps
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="public-panel border-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Gaps Detected</CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground">{data.opportunities.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-orange-400">
              <TrendingUp className="w-3 h-3" />
              <span>Available next 30 days</span>
            </div>
          </CardContent>
        </Card>
        <Card className="public-panel border-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Active Campaigns</CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground">{data.campaigns.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Running autonomously</span>
            </div>
          </CardContent>
        </Card>
        <Card className="public-panel border-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Revenue Generated</CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground">₹0</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="w-3 h-3" />
              <span>Last sync: Just now</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed: Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Kaisa's Suggestions
          </h2>

          {data.opportunities.length === 0 ? (
            <div className="public-panel/50 border border-white/5 rounded-2xl p-12 text-center space-y-4">
              <div className="p-4 bg-white/5 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-foreground/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-foreground font-bold">No opportunities found</h3>
                <p className="text-foreground/40 text-sm">Try scanning for availability gaps or check your integrations.</p>
              </div>
              <Button variant="outline" onClick={handleScan} className="border-border text-foreground hover:bg-white/5">
                Refresh Calendar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.opportunities.map((o: any) => (
                <Card key={o.id} className="public-panel border-white/5 hover:border-orange-500/30 transition-all overflow-hidden group">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold">
                            {o.guestName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">{o.guestName}</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{o.listingTitle}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-orange-500/10 px-2 py-1 rounded text-[10px] font-bold text-orange-400 uppercase tracking-tighter">
                          <Calendar className="w-3 h-3" />
                          {o.metadata?.gap_days} Day Gap
                        </div>
                      </div>

                      <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-sm text-foreground/80 leading-relaxed italic">
                        "{o.message}"
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Target: Returning Guest
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Channel: WhatsApp
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 md:w-48 p-4 flex md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-white/5">
                      <Button 
                        onClick={() => handleApprove(o.id)}
                        className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold text-xs py-1"
                      >
                        Approve & Send
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="flex-1 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 text-xs font-bold py-1"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Campaigns & Performance */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            Campaigns
          </h2>
          
          <Card className="public-panel border-white/5">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-sm text-foreground">Gap Filler</CardTitle>
              <CardDescription className="text-xs">Fills contiguous empty dates automatically</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground uppercase font-bold tracking-tighter">Status</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground uppercase font-bold tracking-tighter">Conversion Rate</span>
                <span className="text-foreground font-bold">0%</span>
              </div>
              <Button variant="outline" className="w-full border-border text-foreground/70 text-xs font-bold hover:bg-white/5">
                Configure Rules
              </Button>
            </CardContent>
          </Card>

          <Card className="public-panel border-white/5 opacity-50">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                Review Boost
                <span className="text-[10px] bg-white/10 text-foreground/60 px-1.5 py-0.5 rounded uppercase tracking-tighter font-bold">Soon</span>
              </CardTitle>
              <CardDescription className="text-xs">Follows up with guests after checkout</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button disabled className="w-full bg-white/10 text-foreground/30 text-xs font-bold">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl space-y-3">
             <div className="flex items-center gap-2 text-orange-400">
               <TrendingUp className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-tight">Growth Tip</span>
             </div>
             <p className="text-[11px] text-orange-200/70 leading-relaxed">
               Gaps of 2-3 days are harder to fill. Kaisa recommends offering a 15% discount for "Gap Filler" campaigns to boost conversion.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
