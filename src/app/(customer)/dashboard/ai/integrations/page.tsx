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

export default function ServiceIntegrationsPage() {
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
        <div className="space-y-1">
            <h1 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">
              Connectivity Hub
            </h1>
            <p className="text-zinc-500 font-medium italic">Link your channels to activate Omni AI across your entire operation.</p>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[240px]">
            <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <span>Infrastructure Readiness</span>
                <span className="text-blue-600">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                <div 
                    className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
      </header>

      <div className="flex items-center gap-1 bg-zinc-100/50 w-fit p-1 rounded-xl border border-zinc-200">
        <button 
            onClick={() => setActiveTab("all")}
            className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "all" ? "bg-white text-zinc-950 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-700"
            )}
        >
            All Channels
        </button>
        <button 
            onClick={() => setActiveTab("messengers")}
            className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "messengers" ? "bg-white text-zinc-950 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-700"
            )}
        >
            Messaging
        </button>
        <button 
            onClick={() => setActiveTab("calendars")}
            className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "calendars" ? "bg-white text-zinc-950 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-700"
            )}
        >
            Calendars
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        

        {/* Google Integration */}
        {capabilities.integrations.google && (activeTab === "all" || activeTab === "calendars") && (
          <Card className="bg-white border-zinc-200 shadow-sm relative overflow-hidden group rounded-2xl">
            <CardHeader className="bg-zinc-50/50">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-zinc-200 p-2.5 shadow-sm">
                            <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-full h-full" />
                        </div>
                        <div>
                            <CardTitle className="text-zinc-950 text-base font-black uppercase tracking-tight">Google Workspace</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs font-medium italic">Institutional calendar & email sync</CardDescription>
                        </div>
                    </div>
                    {isGoogleConnected ? (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-100 bg-emerald-50 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">CONNECTED</Badge>
                    ) : isGoogleExpired ? (
                      <Badge variant="outline" className="text-rose-600 border-rose-100 bg-rose-50 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">EXPIRED</Badge>
                    ) : (
                      <Badge variant="outline" className="text-zinc-400 border-zinc-100 bg-zinc-50 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">INACTIVE</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-3">
                   <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 uppercase tracking-widest font-black">Linked Identity</span>
                        <span className="text-zinc-950 font-bold">{googleStatus?.connectedEmail || "Unspecified"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 uppercase tracking-widest font-black">Sync Protocol</span>
                        <span className="text-zinc-950 font-bold">OAuth 2.0 Secure</span>
                    </div>
                </div>
                
                {isGoogleConnected || isGoogleExpired || isGoogleError ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={handleDisconnectGoogle}
                      disabled={isLoading}
                      className="flex-1 h-10 px-4 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                    >
                      Terminate Link
                    </button>
                    {(isGoogleExpired || isGoogleError) && (
                        <button 
                        onClick={handleConnectGoogle}
                        disabled={isConnectingGoogle}
                        className="flex-1 h-10 px-4 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                      >
                        Renew Authority
                      </button>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={handleConnectGoogle}
                    disabled={isConnectingGoogle || isLoading}
                    className="w-full h-12 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    {isConnectingGoogle ? "Establishing Link..." : "Enable Google Sync"}
                  </button>
                )}
            </CardContent>
          </Card>
        )}

        {/* Service Sync (per-resource) */}
        {capabilities.integrations.ical && (activeTab === "all" || activeTab === "calendars") && (
          <Card className="bg-white border-zinc-200 shadow-sm relative overflow-hidden rounded-2xl">
            <CardHeader className="bg-zinc-50/50">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center border border-blue-700 p-2.5 shadow-lg shadow-blue-500/20">
                            <Puzzle className="w-full h-full text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-zinc-950 text-base font-black uppercase tracking-tight">Channel Manager</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs font-medium italic">Omnichannel Resource Sync</CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs text-blue-900 font-black uppercase tracking-tight">Granular Control Required</p>
                            <p className="text-[10px] text-blue-700/80 font-medium leading-relaxed">
                                Synchronisation is managed at the individual {labels.listing.toLowerCase()} level. Visit the Services directory to link specific external platforms.
                            </p>
                        </div>
                    </div>
                </div>
                <Button className="w-full h-12 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95" asChild>
                    <Link href="/dashboard/ai/listings">
                        Manage {labels.listings} <ExternalLink className="w-4 h-4 ml-2" />
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
        <Card className="bg-white border-zinc-200 shadow-sm relative overflow-hidden group rounded-2xl">
          <CardHeader className="bg-zinc-50/50">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-zinc-200 p-2.5 shadow-sm">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram" className="w-full h-full" />
                      </div>
                      <div>
                          <CardTitle className="text-zinc-950 text-base font-black uppercase tracking-tight">Telegram Bot</CardTitle>
                          <CardDescription className="text-zinc-500 text-xs font-medium italic">Automated client interactions</CardDescription>
                      </div>
                  </div>
                  <Badge variant="outline" className="text-zinc-400 border-zinc-100 bg-zinc-50 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">BETA</Badge>
              </div>
          </CardHeader>
          <CardContent className="pt-6">
             <Button asChild className="w-full h-12 bg-white text-zinc-950 border border-zinc-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95 shadow-sm">
                 <Link href="/dashboard/integrations/telegram">
                     Configure Protocol <ExternalLink className="w-4 h-4 ml-2" />
                 </Link>
             </Button>
          </CardContent>
        </Card>

        {/* Nodebase Voice Integration */}
        <Card className="bg-white border-zinc-200 shadow-sm relative overflow-hidden group rounded-2xl">
          <CardHeader className="bg-zinc-50/50">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center border border-blue-700 p-2.5 shadow-lg shadow-blue-500/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white w-full h-full"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                      </div>
                      <div>
                          <CardTitle className="text-zinc-950 text-base font-black uppercase tracking-tight">Executive Voice</CardTitle>
                          <CardDescription className="text-zinc-500 text-xs font-medium italic">High-fidelity telephony AI</CardDescription>
                      </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">WAITLIST</Badge>
              </div>
          </CardHeader>
          <CardContent className="pt-6">
             <Button asChild className="w-full h-12 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                 <Link href="/dashboard/ai/settings">Request Access</Link>
             </Button>
          </CardContent>
        </Card>

        {/* Nodebase Eyes (CCTV) */}
        <Card className="bg-white border-zinc-200 shadow-sm relative overflow-hidden group rounded-2xl">
          <CardHeader className="bg-zinc-50/50">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center border border-blue-700 p-2.5 shadow-lg shadow-blue-500/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white w-full h-full"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      </div>
                      <div>
                          <CardTitle className="text-zinc-950 text-base font-black uppercase tracking-tight">Vision Interface</CardTitle>
                          <CardDescription className="text-zinc-500 text-xs font-medium italic">Visual AI for institutional security</CardDescription>
                      </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">WAITLIST</Badge>
              </div>
          </CardHeader>
          <CardContent className="pt-6">
             <Button asChild className="w-full h-12 bg-white text-zinc-950 border border-zinc-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95 shadow-sm">
                 <Link href="/dashboard/ai/settings">Request Access</Link>
             </Button>
          </CardContent>
        </Card>


        {/* Instagram Integration */}
        {capabilities.integrations.instagram && (activeTab === "all" || activeTab === "messengers") && (
          <Card className="bg-white border-zinc-200 shadow-sm relative overflow-hidden group rounded-2xl">
            <CardHeader className="bg-zinc-50/50">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-zinc-200 p-2.5 shadow-sm">
                            <Image 
                              src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" 
                              alt="Instagram" 
                              width={32} 
                              height={32} 
                              className="w-full h-full"
                            />
                        </div>
                        <div>
                            <CardTitle className="text-zinc-950 text-base font-black uppercase tracking-tight">Instagram Meta</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs font-medium italic">Social presence automation</CardDescription>
                        </div>
                    </div>
                    {isInstagramConnected ? (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-100 bg-emerald-50 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">CONNECTED</Badge>
                    ) : (
                      <Badge variant="outline" className="text-zinc-400 border-zinc-100 bg-zinc-50 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">INACTIVE</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
               <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-3">
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 uppercase tracking-widest font-black">Linked Profile</span>
                        <span className="text-zinc-950 font-bold">{instagramStatus?.connectedName || "Unspecified"}</span>
                    </div>
               </div>

               {isInstagramConnected ? (
                 <button 
                   onClick={handleDisconnectInstagram}
                   disabled={isLoading}
                   className="w-full h-10 px-4 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                 >
                   Terminate Link
                 </button>
               ) : (
                 <button 
                   onClick={handleConnectInstagram}
                   disabled={isConnectingInstagram || isLoading}
                   className="w-full h-12 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                 >
                   {isConnectingInstagram ? "Establishing Link..." : "Enable Instagram Sync"}
                 </button>
               )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
