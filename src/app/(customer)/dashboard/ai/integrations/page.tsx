"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Puzzle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  LogOut,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels, getPersonaCapabilities } from "@/lib/business-context";
import { toast } from "sonner";
import { WhatsAppBYONCard } from "@/components/dashboard/integrations/WhatsAppBYONCard";
import { fetchWithAuth } from "@/lib/api/fetcher";

interface GoogleIntegrationStatus {
  status: "connected" | "disconnected" | "expired" | "error";
  services: {
    gmail: boolean;
    calendar: boolean;
    business: boolean;
  };
  connectedEmail: string | null;
  connectedName: string | null;
  lastSyncedAt: string | null;
  expiresAt: string | null;
  errorCode: string | null;
}

interface GenericIntegrationStatus {
  status: "connected" | "disconnected";
  connectedName: string | null;
  lastSyncedAt: string | null;
  metadata?: Record<string, any>;
}

export default function ListingIntegrationsPage() {
  const { tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);
  const capabilities = getPersonaCapabilities(tenant?.businessType);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [googleStatus, setGoogleStatus] = useState<GoogleIntegrationStatus | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<GenericIntegrationStatus | null>(null);
  const [instagramStatus, setInstagramStatus] = useState<GenericIntegrationStatus | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isConnectingWhatsApp, setIsConnectingWhatsApp] = useState(false);
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "messengers" | "calendars">("all");

  const isGoogleConnected = googleStatus?.status === "connected";
  const isWhatsAppConnected = whatsappStatus?.status === "connected";
  const isInstagramConnected = instagramStatus?.status === "connected";

  const connectedCount = [
    isGoogleConnected,
    isWhatsAppConnected,
    isInstagramConnected
  ].filter(Boolean).length;
  
  const totalAvailable = [
    capabilities.integrations.google,
    capabilities.integrations.whatsapp,
    capabilities.integrations.instagram
  ].filter(Boolean).length;

  const progress = Math.round((connectedCount / totalAvailable) * 100);

  // Deprecated direct check, use capabilities
  // const isAirbnbHost = tenant?.businessType === "airbnb_host";

  useEffect(() => {
    fetchAllStatuses();

    // Check URL params for status/error
    const statusParam = searchParams.get("status");
    const errorParam = searchParams.get("error");

    if (statusParam === "connected") {
      toast.success("Account connected successfully");
      // Clean up URL
      router.replace("/dashboard/ai/integrations");
    } else if (errorParam) {
      toast.error(`Connection failed: ${errorParam}`);
      router.replace("/dashboard/ai/integrations");
    }
  }, [searchParams, capabilities]);

  const fetchAllStatuses = async () => {
    setIsLoading(true);
    try {
      const promises = [];
      if (capabilities.integrations.google) promises.push(fetchGoogleStatus());
      if (capabilities.integrations.whatsapp) promises.push(fetchWhatsappStatus());
      if (capabilities.integrations.instagram) promises.push(fetchInstagramStatus());
      
      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to fetch integration statuses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGoogleStatus = async () => {
    try {
      const res = await fetch("/api/integrations/google/status");
      if (res.ok) {
        const data = await res.json();
        setGoogleStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch Google status:", error);
    }
  };

  const fetchWhatsappStatus = async () => {
    try {
      const res = await fetch("/api/integrations/whatsapp/status");
      if (res.ok) {
        const data = await res.json();
        setWhatsappStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch WhatsApp status:", error);
    }
  };

  const fetchInstagramStatus = async () => {
    try {
      const res = await fetch("/api/integrations/instagram/status");
      if (res.ok) {
        const data = await res.json();
        setInstagramStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch Instagram status:", error);
    }
  };

  const handleConnectGoogle = async () => {
    if (!capabilities.integrations.google) return;
    
    setIsConnectingGoogle(true);
    try {
      const data = await fetchWithAuth<{ url?: string }>("/api/integrations/google/connect", { method: "POST" });
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to initiate connection");
        setIsConnectingGoogle(false);
      }
    } catch (error) {
      toast.error("An error occurred");
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm("Are you sure you want to disconnect? This will stop calendar syncing.")) return;

    try {
      setIsLoading(true);
      await fetchWithAuth("/api/integrations/google/disconnect", { method: "POST" });
      toast.success("Disconnected successfully");
      fetchGoogleStatus();
    } catch (error) {
      toast.error("Failed to disconnect");
      setIsLoading(false);
    }
  };

  const handleConnectWhatsApp = async () => {
    if (!capabilities.integrations.whatsapp) return;
    
    setIsConnectingWhatsApp(true);
    try {
      const data = await fetchWithAuth<{ success?: boolean; error?: string; status?: string; qrUrl?: string }>(
        "/api/integrations/whatsapp/connect",
        { method: "POST" }
      );
      if (data?.error) {
        toast.error(data.error || "Failed to connect WhatsApp");
      } else {
        toast.success("WhatsApp connected successfully");
        fetchWhatsappStatus();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsConnectingWhatsApp(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm("Are you sure you want to disconnect WhatsApp?")) return;

    try {
      setIsLoading(true);
      await fetchWithAuth("/api/integrations/whatsapp/disconnect", { method: "POST" });
      toast.success("Disconnected successfully");
      fetchWhatsappStatus();
    } catch (error) {
      toast.error("Failed to disconnect");
      setIsLoading(false);
    }
  };

  const handleConnectInstagram = async () => {
    if (!capabilities.integrations.instagram) return;
    
    setIsConnectingInstagram(true);
    try {
      const data = await fetchWithAuth<{ success?: boolean; error?: string }>("/api/integrations/instagram/connect", {
        method: "POST",
      });
      if (data?.error) {
        toast.error(data.error || "Failed to connect Instagram");
      } else {
        toast.success("Instagram connected successfully");
        fetchInstagramStatus();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsConnectingInstagram(false);
    }
  };

  const handleDisconnectInstagram = async () => {
    if (!confirm("Are you sure you want to disconnect Instagram?")) return;

    try {
      setIsLoading(true);
      await fetchWithAuth("/api/integrations/instagram/disconnect", { method: "POST" });
      toast.success("Disconnected successfully");
      fetchInstagramStatus();
    } catch (error) {
      toast.error("Failed to disconnect");
      setIsLoading(false);
    }
  };

  const isGoogleExpired = googleStatus?.status === "expired";
  const isGoogleError = googleStatus?.status === "error";

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-[0.2em] uppercase">
                <Sparkles className="w-3 h-3" />
                Connectivity
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Integrations</h1>
            <p className="text-zinc-400 text-sm max-w-md line-clamp-2">Link your channels to activate the full power of Nodebase AI and the Sales Pipeline.</p>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[240px]">
            <div className="flex justify-between w-full text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <span>Setup Progress</span>
                <span className="text-primary">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                    className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-[10px] text-zinc-500 italic">
                {connectedCount === totalAvailable ? "🎉 Fully connected!" : `${totalAvailable - connectedCount} more to reach 100%`}
            </p>
        </div>
      </header>

      <div className="flex items-center gap-1 bg-white/5 w-fit p-1 rounded-xl border border-white/5">
        <button 
            onClick={() => setActiveTab("all")}
            className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === "all" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-500 hover:text-zinc-300"
            )}
        >
            All Services
        </button>
        <button 
            onClick={() => setActiveTab("messengers")}
            className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === "messengers" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-500 hover:text-zinc-300"
            )}
        >
            Messaging
        </button>
        <button 
            onClick={() => setActiveTab("calendars")}
            className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === "calendars" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-500 hover:text-zinc-300"
            )}
        >
            Calendars
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        

        {/* Google Integration */}
        {capabilities.integrations.google && (activeTab === "all" || activeTab === "calendars") && (
          <Card className="glass-panel border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <CardHeader className="relative">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 p-2.5 backdrop-blur-md">
                            <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-full h-full" />
                        </div>
                        <div>
                            <CardTitle className="text-white text-lg font-bold">Google Calendar</CardTitle>
                            <CardDescription className="text-zinc-500 text-sm">Sync {labels.bookings.toLowerCase()} to your personal calendar</CardDescription>
                        </div>
                    </div>
                    {isGoogleConnected ? (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10 rounded-full px-3 py-0.5 text-[10px] font-bold">CONNECTED</Badge>
                    ) : isGoogleExpired ? (
                      <Badge variant="outline" className="text-rose-400 border-rose-500/20 bg-rose-500/10 rounded-full px-3 py-0.5 text-[10px] font-bold">EXPIRED</Badge>
                    ) : isGoogleError ? (
                      <Badge variant="outline" className="text-rose-500 border-rose-500/20 bg-rose-500/10 rounded-full px-3 py-0.5 text-[10px] font-bold">ERROR</Badge>
                    ) : (
                      <Badge variant="outline" className="text-zinc-500 border-white/10 bg-white/5 rounded-full px-3 py-0.5 text-[10px] font-bold">DISCONNECTED</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 relative">
                <div className={`p-4 rounded-xl border space-y-3 transition-colors ${isGoogleConnected ? 'bg-emerald-500/5 border-emerald-500/10' : isGoogleError ? 'bg-rose-500/5 border-rose-500/10' : 'bg-white/5 border-white/10'}`}>
                   <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 uppercase tracking-widest font-bold">Email</span>
                        <span className="text-white font-mono">{googleStatus?.connectedEmail || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 uppercase tracking-widest font-bold">Last Sync</span>
                        <span className="text-white font-mono">
                          {googleStatus?.lastSyncedAt ? new Date(googleStatus.lastSyncedAt).toLocaleString() : "-"}
                        </span>
                    </div>
                    {isGoogleError && googleStatus?.errorCode && (
                        <div className="flex items-center gap-2 text-sm text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>Error: {googleStatus.errorCode}</span>
                        </div>
                    )}
                </div>
                
                {isGoogleConnected || isGoogleExpired || isGoogleError ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={handleDisconnectGoogle}
                      disabled={isLoading}
                      className="button-glass flex-1 border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                    {(isGoogleExpired || isGoogleError) && (
                        <button 
                        onClick={handleConnectGoogle}
                        disabled={isConnectingGoogle}
                        className="button-primary flex-1"
                      >
                        {isConnectingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Reconnect
                      </button>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={handleConnectGoogle}
                    disabled={isConnectingGoogle || isLoading}
                    className="button-primary w-full"
                  >
                    {isConnectingGoogle ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
                    ) : (
                      "Link Google Account"
                    )}
                  </button>
                )}
            </CardContent>
          </Card>
        )}

        {/* OTA Integrations (iCal) */}
        {capabilities.integrations.ical && (activeTab === "all" || activeTab === "calendars") && (
          <Card className="glass-panel border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <CardHeader className="relative">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#FF5A5F]/20 rounded-2xl flex items-center justify-center border border-[#FF5A5F]/30 p-2.5">
                            <Puzzle className="w-full h-full text-[#FF5A5F]" />
                        </div>
                        <div>
                            <CardTitle className="text-white text-lg font-bold">Airbnb / OTAs</CardTitle>
                            <CardDescription className="text-zinc-500 text-sm">Automated Channel Management</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-blue-400 border-blue-500/20 bg-blue-500/10 rounded-full px-3 py-0.5 text-[10px] font-bold">
                        PROPERTY-LEVEL
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 relative">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm text-blue-100 font-bold">Configuration Moved</p>
                            <p className="text-xs text-blue-200/60 leading-relaxed">
                                OTA sync is now configured per {labels.listing.toLowerCase()}. Visit {labels.listings.toLowerCase()} &gt; Settings to link Airbnb, MMT or Booking.com.
                            </p>
                        </div>
                    </div>
                </div>
                <Button className="button-primary w-full" asChild>
                    <Link href="/dashboard/ai/listings">
                        Go to {labels.listings} <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
            </CardContent>
          </Card>
        )}

        {/* WhatsApp Integration */}
        {capabilities.integrations.whatsapp && (activeTab === "all" || activeTab === "messengers") && (
          <WhatsAppBYONCard initialStatus={whatsappStatus as any} />
        )}

        
        {/* Telegram Integration */}
        <Card className="glass-panel border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0088cc]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <CardHeader>
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#0088cc]/20 rounded-2xl flex items-center justify-center border border-[#0088cc]/30 p-2.5">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram" className="w-full h-full" />
                      </div>
                      <div>
                          <CardTitle className="text-white text-lg font-bold">Telegram</CardTitle>
                          <CardDescription className="text-zinc-500 text-sm">AI-powered bot messaging</CardDescription>
                      </div>
                  </div>
                  <Badge variant="outline" className="text-zinc-500 border-white/10 bg-white/5 rounded-full px-3 py-0.5 text-[10px] font-bold">BETA</Badge>
              </div>
          </CardHeader>
          <CardContent>
             <Button asChild className="button-primary w-full shadow-[#0088cc]/20 border-[#0088cc]/30">
                 <Link href="/dashboard/integrations/telegram">
                     Configure Telegram Bot <ExternalLink className="w-4 h-4 ml-2" />
                 </Link>
             </Button>
          </CardContent>
        </Card>

        {/* Nodebase Voice Integration */}
        <Card className="glass-panel border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <CardHeader className="relative">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30 p-2.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 w-full h-full"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                      </div>
                      <div>
                          <CardTitle className="text-white text-lg font-bold">Nodebase Voice</CardTitle>
                          <CardDescription className="text-zinc-500 text-sm">Human-like AI Phone Agents</CardDescription>
                      </div>
                  </div>
                  <Badge variant="outline" className="text-orange-400 border-orange-500/20 bg-orange-500/10 rounded-full px-3 py-0.5 text-[10px] font-bold">WAITLIST</Badge>
              </div>
          </CardHeader>
          <CardContent className="relative">
             <Button asChild className="button-primary w-full shadow-orange-500/20 border-orange-500/30">
                 <Link href="/dashboard/ai/settings">Join Voice Waitlist</Link>
             </Button>
          </CardContent>
        </Card>

        {/* Nodebase Eyes (CCTV) */}
        <Card className="glass-panel border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <CardHeader className="relative">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 p-2.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 w-full h-full"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      </div>
                      <div>
                          <CardTitle className="text-white text-lg font-bold">Nodebase Eyes</CardTitle>
                          <CardDescription className="text-zinc-500 text-sm">Vision AI for physical spaces</CardDescription>
                      </div>
                  </div>
                  <Badge variant="outline" className="text-blue-400 border-blue-500/20 bg-blue-500/10 rounded-full px-3 py-0.5 text-[10px] font-bold">WAITLIST</Badge>
              </div>
          </CardHeader>
          <CardContent className="relative">
             <Button asChild className="button-primary w-full shadow-blue-500/20">
                 <Link href="/dashboard/ai/settings">Join Vision Waitlist</Link>
             </Button>
          </CardContent>
        </Card>


        {/* Instagram Integration */}
        {capabilities.integrations.instagram && (activeTab === "all" || activeTab === "messengers") && (
          <Card className="glass-panel border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <CardHeader className="relative">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-2xl flex items-center justify-center border border-white/10 p-2.5">
                            <Image 
                              src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" 
                              alt="Instagram" 
                              width={32} 
                              height={32} 
                              className="w-full h-full invert"
                            />
                        </div>
                        <div>
                            <CardTitle className="text-white text-lg font-bold">Instagram</CardTitle>
                            <CardDescription className="text-zinc-500 text-sm">Automated DM & Social Replies</CardDescription>
                        </div>
                    </div>
                    {isInstagramConnected ? (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10 rounded-full px-3 py-0.5 text-[10px] font-bold">CONNECTED</Badge>
                    ) : (
                      <Badge variant="outline" className="text-zinc-500 border-white/10 bg-white/5 rounded-full px-3 py-0.5 text-[10px] font-bold">DISCONNECTED</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 relative">
               <div className={`p-4 rounded-xl border space-y-3 ${isInstagramConnected ? 'bg-gradient-to-tr from-[#f09433]/5 via-[#dc2743]/5 to-[#bc1888]/5 border-pink-500/10' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 uppercase tracking-widest font-bold">Handle</span>
                        <span className="text-white font-mono">{instagramStatus?.connectedName || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 uppercase tracking-widest font-bold">Last Sync</span>
                        <span className="text-white font-mono">
                          {instagramStatus?.lastSyncedAt ? new Date(instagramStatus.lastSyncedAt).toLocaleString() : "-"}
                        </span>
                    </div>
               </div>

               {isInstagramConnected ? (
                 <button 
                   onClick={handleDisconnectInstagram}
                   disabled={isLoading}
                   className="button-glass w-full border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                 >
                   <LogOut className="w-4 h-4" />
                   Disconnect
                 </button>
               ) : (
                 <button 
                   onClick={handleConnectInstagram}
                   disabled={isConnectingInstagram || isLoading}
                   className="button-primary w-full shadow-pink-500/20 border-pink-500/30"
                 >
                   {isConnectingInstagram ? (
                     <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
                   ) : (
                     "Link Instagram"
                   )}
                 </button>
               )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
