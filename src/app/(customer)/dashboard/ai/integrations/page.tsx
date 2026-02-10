"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Puzzle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  LogOut,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels, getPersonaCapabilities } from "@/lib/business-context";
import { toast } from "sonner";

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
      const res = await fetch("/api/integrations/google/connect", { method: "POST" });
      const data = await res.json();
      
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
      await fetch("/api/integrations/google/disconnect", { method: "POST" });
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
      const res = await fetch("/api/integrations/whatsapp/connect", { method: "POST" });
      if (res.ok) {
        toast.success("WhatsApp connected successfully");
        fetchWhatsappStatus();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to connect WhatsApp");
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
      await fetch("/api/integrations/whatsapp/disconnect", { method: "POST" });
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
      const res = await fetch("/api/integrations/instagram/connect", { method: "POST" });
      if (res.ok) {
        toast.success("Instagram connected successfully");
        fetchInstagramStatus();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to connect Instagram");
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
      await fetch("/api/integrations/instagram/disconnect", { method: "POST" });
      toast.success("Disconnected successfully");
      fetchInstagramStatus();
    } catch (error) {
      toast.error("Failed to disconnect");
      setIsLoading(false);
    }
  };

  const isGoogleConnected = googleStatus?.status === "connected";
  const isGoogleExpired = googleStatus?.status === "expired";
  const isGoogleError = googleStatus?.status === "error";

  const isWhatsAppConnected = whatsappStatus?.status === "connected";
  const isInstagramConnected = instagramStatus?.status === "connected";

  return (
    <div className="space-y-6 pb-24 md:pb-0 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Integrations</h1>
        <p className="text-white/60">Manage your connected apps and services.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Google Integration */}
        {capabilities.integrations.google && (
          <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-white">Google Calendar</CardTitle>
                            <CardDescription className="text-white/50">Sync {labels.bookings.toLowerCase()} to your personal calendar</CardDescription>
                        </div>
                    </div>
                    {isGoogleConnected ? (
                      <Badge variant="outline" className="text-green-400 border-green-400/20 bg-green-400/10">Connected</Badge>
                    ) : isGoogleExpired ? (
                      <Badge variant="outline" className="text-red-400 border-red-400/20 bg-red-400/10">Expired</Badge>
                    ) : isGoogleError ? (
                      <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/10">Error</Badge>
                    ) : (
                      <Badge variant="outline" className="text-zinc-500 border-zinc-500/20 bg-zinc-500/10">Not Connected</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg border space-y-3 ${isGoogleConnected ? 'bg-green-500/5 border-green-500/10' : isGoogleError ? 'bg-red-500/5 border-red-500/10' : 'bg-black/20 border-white/5 opacity-50'}`}>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Connected Account</span>
                        <span className="text-white font-mono">{googleStatus?.connectedEmail || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Last synced</span>
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
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={handleDisconnectGoogle}
                      disabled={isLoading}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                    {(isGoogleExpired || isGoogleError) && (
                        <Button 
                        variant="default" 
                        className="w-full bg-white text-black hover:bg-gray-200"
                        onClick={handleConnectGoogle}
                        disabled={isConnectingGoogle}
                      >
                        {isConnectingGoogle ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Reconnect
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button 
                    variant="default" 
                    className="w-full bg-white text-black hover:bg-gray-200"
                    onClick={handleConnectGoogle}
                    disabled={isConnectingGoogle || isLoading}
                  >
                    {isConnectingGoogle ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
                    ) : (
                      "Connect Google Account"
                    )}
                  </Button>
                )}
            </CardContent>
          </Card>
        )}

        {/* OTA Integrations (iCal) */}
        {capabilities.integrations.ical && (
          <Card className="bg-[var(--color-dashboard-surface)] border-white/10 opacity-75">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FF5A5F] rounded-full flex items-center justify-center">
                            <Puzzle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-white">Airbnb, Booking.com, MMT</CardTitle>
                            <CardDescription className="text-white/50">Channel manager & calendar sync</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-blue-400 border-blue-400/20 bg-blue-400/10">
                        Managed per {labels.listing}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm text-blue-200 font-medium">Moved to {labels.listings}</p>
                            <p className="text-xs text-blue-200/70">
                                To sync calendars with OTAs like Airbnb or Booking.com, go to a specific {labels.listing.toLowerCase()} and click "Platform Sync".
                            </p>
                        </div>
                    </div>
                </div>
                <Button asChild className="w-full bg-white text-black hover:bg-gray-200">
                    <Link href="/dashboard/ai/listings">
                        Go to {labels.listings} <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
            </CardContent>
          </Card>
        )}

        {/* WhatsApp Integration */}
        {capabilities.integrations.whatsapp && (
          <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
                            <Puzzle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-white">WhatsApp Business</CardTitle>
                            <CardDescription className="text-white/50">Send {labels.booking.toLowerCase()} confirmations</CardDescription>
                        </div>
                    </div>
                    {isWhatsAppConnected ? (
                      <Badge variant="outline" className="text-green-400 border-green-400/20 bg-green-400/10">Connected</Badge>
                    ) : (
                      <Badge variant="outline" className="text-zinc-500 border-zinc-500/20 bg-zinc-500/10">Not Connected</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className={`p-4 rounded-lg border space-y-3 ${isWhatsAppConnected ? 'bg-green-500/5 border-green-500/10' : 'bg-black/20 border-white/5 opacity-50'}`}>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Connected Account</span>
                        <span className="text-white font-mono">{whatsappStatus?.connectedName || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Last synced</span>
                        <span className="text-white font-mono">
                          {whatsappStatus?.lastSyncedAt ? new Date(whatsappStatus.lastSyncedAt).toLocaleString() : "-"}
                        </span>
                    </div>
               </div>

               {isWhatsAppConnected ? (
                 <Button 
                   variant="outline" 
                   className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                   onClick={handleDisconnectWhatsApp}
                   disabled={isLoading}
                 >
                   <LogOut className="w-4 h-4 mr-2" />
                   Disconnect
                 </Button>
               ) : (
                 <Button 
                   variant="default" 
                   className="w-full bg-[#25D366] text-white hover:bg-[#1EBE57]"
                   onClick={handleConnectWhatsApp}
                   disabled={isConnectingWhatsApp || isLoading}
                 >
                   {isConnectingWhatsApp ? (
                     <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
                   ) : (
                     "Connect WhatsApp"
                   )}
                 </Button>
               )}
            </CardContent>
          </Card>
        )}

        {/* Instagram Integration */}
        {capabilities.integrations.instagram && (
          <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-full flex items-center justify-center">
                            <Puzzle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-white">Instagram</CardTitle>
                            <CardDescription className="text-white/50">Reply to DMs & Orders</CardDescription>
                        </div>
                    </div>
                    {isInstagramConnected ? (
                      <Badge variant="outline" className="text-green-400 border-green-400/20 bg-green-400/10">Connected</Badge>
                    ) : (
                      <Badge variant="outline" className="text-zinc-500 border-zinc-500/20 bg-zinc-500/10">Not Connected</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className={`p-4 rounded-lg border space-y-3 ${isInstagramConnected ? 'bg-gradient-to-tr from-[#f09433]/5 via-[#dc2743]/5 to-[#bc1888]/5 border-pink-500/10' : 'bg-black/20 border-white/5 opacity-50'}`}>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Connected Account</span>
                        <span className="text-white font-mono">{instagramStatus?.connectedName || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Last synced</span>
                        <span className="text-white font-mono">
                          {instagramStatus?.lastSyncedAt ? new Date(instagramStatus.lastSyncedAt).toLocaleString() : "-"}
                        </span>
                    </div>
               </div>

               {isInstagramConnected ? (
                 <Button 
                   variant="outline" 
                   className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                   onClick={handleDisconnectInstagram}
                   disabled={isLoading}
                 >
                   <LogOut className="w-4 h-4 mr-2" />
                   Disconnect
                 </Button>
               ) : (
                 <Button 
                   variant="default" 
                   className="w-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-90"
                   onClick={handleConnectInstagram}
                   disabled={isConnectingInstagram || isLoading}
                 >
                   {isConnectingInstagram ? (
                     <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
                   ) : (
                     "Connect Instagram"
                   )}
                 </Button>
               )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
