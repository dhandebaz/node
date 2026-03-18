
"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Home, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Loader2,
  Sparkles,
  Zap,
  DollarSign
} from "lucide-react";
import { getRevenueDataAction, generatePriceSuggestionsAction, applyPriceSuggestionAction } from "@/app/actions/revenue";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>({ suggestions: [] });

  const fetchData = async () => {
    try {
      const result = await getRevenueDataAction();
      setData(result);
    } catch (e) {
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // In a real system, we'd loop through all listings or have a global action
      // For now, let's just refresh the data
      await fetchData();
      toast.success("Price suggestions refreshed!");
    } catch (e) {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleApply = async (id: string) => {
    try {
      await applyPriceSuggestionAction(id);
      toast.success("Price updated successfully!");
      fetchData();
    } catch (e) {
      toast.error("Failed to apply price");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--public-ink)]/40" />
        <p className="text-[var(--public-ink)]/40 text-sm">Analyzing market trends...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--public-ink)] uppercase tracking-tight flex items-center gap-3">
            <TrendingUp className="text-emerald-500 w-8 h-8" />
            Revenue & Pricing
          </h1>
          <p className="text-[var(--public-ink)]/50 text-sm">
            AI-driven nightly rate optimization based on occupancy and local demand.
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          className="border-[var(--public-line)] text-[var(--public-ink)] hover:bg-white/5 font-bold px-6 rounded-full"
        >
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Refresh Trends
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="public-panel border-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-[var(--public-muted)]">Suggested Uplift</CardDescription>
            <CardTitle className="text-3xl font-bold text-[var(--public-ink)]">+₹2,400</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>Available next 30 days</span>
            </div>
          </CardContent>
        </Card>
        <Card className="public-panel border-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-[var(--public-muted)]">Average Occupancy</CardDescription>
            <CardTitle className="text-3xl font-bold text-[var(--public-ink)]">68%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Above market average (54%)</span>
            </div>
          </CardContent>
        </Card>
        <Card className="public-panel border-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-[var(--public-muted)]">Total Revenue</CardDescription>
            <CardTitle className="text-3xl font-bold text-[var(--public-ink)]">₹48,200</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-[var(--public-muted)]">
              <DollarSign className="w-3 h-3" />
              <span>This month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed: Price Suggestions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-[var(--public-ink)] uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            Pricing Opportunities
          </h2>

          {data.suggestions.length === 0 ? (
            <div className="public-panel/50 border border-white/5 rounded-2xl p-12 text-center space-y-4">
              <div className="p-4 bg-white/5 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-[var(--public-ink)]/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-[var(--public-ink)] font-bold">Your pricing is optimal</h3>
                <p className="text-[var(--public-ink)]/40 text-sm">Kaisa hasn't found any immediate price adjustments for your listings.</p>
              </div>
              <Button variant="outline" onClick={handleRefresh} className="border-[var(--public-line)] text-[var(--public-ink)] hover:bg-white/5">
                Re-scan Market
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.suggestions.map((s: any) => {
                const isPriceUp = s.suggestedPrice > s.currentPrice;
                return (
                  <Card key={s.id} className="public-panel border-white/5 hover:border-emerald-500/30 transition-all overflow-hidden group">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-[var(--public-ink)]">
                                {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}
                              </div>
                              <div className="text-[10px] text-[var(--public-muted)] uppercase tracking-widest">{s.listingTitle}</div>
                            </div>
                          </div>
                          <div className={cn(
                            "flex items-center gap-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter",
                            isPriceUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          )}>
                            {isPriceUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {isPriceUp ? "High Demand" : "Occupancy Boost"}
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div>
                            <div className="text-[10px] text-[var(--public-muted)] uppercase font-bold mb-1">Current</div>
                            <div className="text-lg font-bold text-[var(--public-ink)]/40 line-through">₹{s.currentPrice}</div>
                          </div>
                          <div className="text-zinc-700">→</div>
                          <div>
                            <div className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Suggested</div>
                            <div className="text-2xl font-bold text-emerald-400">₹{s.suggestedPrice}</div>
                          </div>
                          <div className="ml-auto text-right">
                             <div className="text-[10px] text-[var(--public-muted)] uppercase font-bold mb-1">Reason</div>
                             <div className="text-xs text-[var(--public-ink)]/80">{s.reason}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 md:w-40 p-4 flex md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-white/5">
                        <Button 
                          onClick={() => handleApply(s.id)}
                          className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold text-xs py-1"
                        >
                          Apply Price
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="flex-1 text-[var(--public-muted)] hover:text-[var(--public-ink)] hover:bg-white/5 text-xs font-bold py-1"
                        >
                          Ignore
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: Pricing Rules & Intelligence */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[var(--public-ink)] uppercase tracking-wider flex items-center gap-2">
            <Home className="w-5 h-5 text-[var(--public-muted)]" />
            Pricing Rules
          </h2>
          
          <Card className="public-panel border-white/5">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-sm text-[var(--public-ink)]">Balanced Strategy</CardTitle>
              <CardDescription className="text-xs">Prioritizes both occupancy and revenue</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--public-muted)] uppercase font-bold tracking-tighter">Weekend Markup</span>
                <span className="text-[var(--public-ink)] font-bold">1.2x</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--public-muted)] uppercase font-bold tracking-tighter">Last Minute</span>
                <span className="text-[var(--public-ink)] font-bold">0.8x</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--public-muted)] uppercase font-bold tracking-tighter">Min Price</span>
                <span className="text-[var(--public-ink)] font-bold">₹0</span>
              </div>
              <Button variant="outline" className="w-full border-[var(--public-line)] text-[var(--public-ink)]/70 text-xs font-bold hover:bg-white/5">
                Change Strategy
              </Button>
            </CardContent>
          </Card>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3">
             <div className="flex items-center gap-2 text-emerald-400">
               <Sparkles className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-tight">AI Insight</span>
             </div>
             <p className="text-[11px] text-emerald-200/70 leading-relaxed">
               Weekend occupancy for Homestays in your area is up 12% for the coming month. Kaisa has automatically increased suggested weekend rates to capture this surplus.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
