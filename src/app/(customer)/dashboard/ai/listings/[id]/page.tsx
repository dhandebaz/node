"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Link2, Calendar, MessageSquare, Copy, Loader2, RefreshCw } from "lucide-react";
import { Listing, ListingIntegration, ListingCalendar, ListingPlatform, ListingIntegrationStatus } from "@/types";
import { listingsApi } from "@/lib/api/listings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const platformLabels: Record<ListingPlatform, string> = {
  airbnb: "Airbnb",
  booking: "Booking.com",
  mmt: "MakeMyTrip / GoIbibo"
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;
  const [tab, setTab] = useState<"overview" | "calendar" | "messages">("overview");
  const [listing, setListing] = useState<Listing | null>(null);
  const [integrations, setIntegrations] = useState<ListingIntegration[]>([]);
  const [calendar, setCalendar] = useState<ListingCalendar | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<ListingPlatform | null>(null);

  const lastSyncedAt = useMemo(() => {
    const timestamps = integrations.map((integration) => integration.lastSyncedAt).filter(Boolean) as string[];
    if (timestamps.length === 0) return null;
    return timestamps.sort().slice(-1)[0];
  }, [integrations]);

  const syncStatus = useMemo(() => {
    const connected = integrations.filter((integration) => integration.externalIcalUrl);
    if (integrations.some((integration) => integration.status === "error")) return "Error";
    if (connected.length === 0) return "Not connected";
    if (!lastSyncedAt) return "Never synced";
    return "OK";
  }, [integrations, lastSyncedAt]);

  useEffect(() => {
    const loadListing = async () => {
      try {
        const data = await listingsApi.getListing(listingId);
        setListing(data.listing);
        setIntegrations(data.integrations || []);
        setCalendar(data.calendar || null);
      } catch {
        if (typeof window !== "undefined") {
          const stored = window.localStorage.getItem("local_listings_v2");
          const parsed = stored ? JSON.parse(stored) : [];
          const local = parsed.find((item: any) => item.id === listingId);
          if (local) {
            setListing(local);
            setIntegrations(local.integrations || []);
            setCalendar({ listingId, nodebaseIcalUrl: local.nodebaseIcalUrl });
          }
        }
      }
    };
    loadListing();
  }, [listingId]);

  const nodebaseIcalUrl = useMemo(() => {
    // Always use the real API URL for iCal
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/public/ical/${listingId}`;
  }, [listingId]);

  const updateIntegrationUrl = (platform: ListingPlatform, url: string) => {
    setIntegrations((prev) => {
      const exists = prev.some((item) => item.platform === platform);
      if (!exists) {
        return [
          ...prev,
          {
            listingId,
            platform,
            externalIcalUrl: url,
            lastSyncedAt: null,
            status: url ? "connected" : "not_connected"
          }
        ];
      }
      return prev.map((item) => (item.platform === platform ? { ...item, externalIcalUrl: url } : item));
    });
  };

  const handleSaveIntegrations = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const payload: ListingIntegration[] = integrations.map((integration) => ({
        ...integration,
        status: (integration.externalIcalUrl ? "connected" : "not_connected") as ListingIntegrationStatus
      }));
      await listingsApi.updateIntegrations(listingId, payload);
      toast.success("Calendar links saved");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async (platform: ListingPlatform, url: string) => {
    if (!url) return;
    setSyncing(platform);
    try {
      const res = await fetch(`/api/listings/${listingId}/sync/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, url })
      });
      
      if (!res.ok) throw new Error("Sync failed");
      
      const data = await res.json();
      toast.success(`Synced ${data.count || 0} bookings from ${platformLabels[platform]}`);
      
      // Reload integrations to get updated status/time
      const updatedData = await listingsApi.getListing(listingId);
      setIntegrations(updatedData.integrations || []);
      
    } catch (error) {
      toast.error(`Failed to sync ${platformLabels[platform]}`);
    } finally {
      setSyncing(null);
    }
  };

  if (!listing) {
    return (
      <div className="space-y-6 pb-24 md:pb-0">
        <div className="dashboard-surface p-6 text-white/70">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">{listing.name}</h1>
        <p className="text-white/60 text-sm">{listing.city}</p>
      </div>

      <div className="flex gap-4 border-b border-white/10">
        {[
          { id: "overview", label: "Overview" },
          { id: "calendar", label: "Calendar Sync" },
          { id: "messages", label: "Messages" }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as typeof tab)}
            className={`px-3 pb-2 text-xs uppercase tracking-widest border-b-2 ${
              tab === item.id ? "text-white border-white" : "text-white/40 border-transparent"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="dashboard-surface p-6 space-y-4">
            <div className="text-sm font-semibold text-white">Property info</div>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-white/70">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/40">Type</div>
                <div>{listing.type}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-white/40">Timezone</div>
                <div>{listing.timezone}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-white/40">Status</div>
                <div>{listing.status === "active" ? "Active" : "Incomplete"}</div>
              </div>
              {listing.internalNotes && (
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/40">Notes</div>
                  <div>{listing.internalNotes}</div>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-surface p-6 space-y-4">
            <div className="text-sm font-semibold text-white">Platforms connected</div>
            {integrations.length === 0 ? (
              <div className="text-sm text-white/60">No platforms connected yet.</div>
            ) : (
              <div className="grid gap-3">
                {integrations.map((integration) => (
                  <div key={integration.platform} className="flex items-center justify-between text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-white/40" />
                      {platformLabels[integration.platform]}
                    </div>
                    <div className="text-white">
                      {integration.externalIcalUrl ? "Connected" : "Not connected"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-surface p-6 space-y-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/40" />
              Calendar sync status
            </div>
            <div className="text-white font-semibold">{syncStatus}</div>
            <div className="text-xs text-white/50">
              Last synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Never"}
            </div>
          </div>
        </div>
      )}

      {tab === "calendar" && (
        <div className="space-y-6">
          {/* Export Section */}
          <div className="dashboard-surface p-6 space-y-4">
            <div className="text-sm font-semibold text-white">Export Calendar</div>
            <p className="text-sm text-white/60">
              Copy this link to Airbnb, Booking.com, or other platforms to sync your Nodebase calendar with them.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/20 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 font-mono truncate">
                {nodebaseIcalUrl}
              </div>
              <Button variant="outline" size="icon" onClick={() => {
                navigator.clipboard.writeText(nodebaseIcalUrl);
                toast.success("Copied to clipboard");
              }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Import Section */}
          <div className="dashboard-surface p-6 space-y-4">
            <div className="text-sm font-semibold text-white">Import Calendars</div>
            <p className="text-sm text-white/60">
              Paste iCal links from other platforms to sync their bookings into Nodebase.
            </p>
            
            <div className="space-y-4">
              {(Object.keys(platformLabels) as ListingPlatform[]).map(platform => {
                const integration = integrations.find(i => i.platform === platform) || {
                  listingId,
                  platform,
                  externalIcalUrl: "",
                  status: "not_connected",
                  lastSyncedAt: null
                };
                
                return (
                  <div key={platform} className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{platformLabels[platform]}</span>
                      {integration.status === 'connected' && (
                         <span className="text-xs text-green-400 flex items-center gap-1">
                           <CheckCircle2 className="w-3 h-3" /> Connected
                         </span>
                      )}
                      {integration.status === 'error' && (
                         <span className="text-xs text-red-400 flex items-center gap-1">
                           Error
                         </span>
                      )}
                    </div>
                    
                    {integration.status === 'error' && integration.errorMessage && (
                      <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                         Failure reason: {integration.errorMessage}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                       <input 
                         className="flex-1 bg-black/20 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                         placeholder={`Paste ${platformLabels[platform]} iCal link here`}
                         value={integration.externalIcalUrl || ""}
                         onChange={(e) => updateIntegrationUrl(platform, e.target.value)}
                       />
                       <Button 
                         variant="secondary"
                         disabled={!integration.externalIcalUrl || syncing === platform}
                         onClick={() => handleSync(platform, integration.externalIcalUrl!)}
                       >
                         {syncing === platform ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sync"}
                       </Button>
                    </div>
                    
                    {integration.lastSyncedAt && (
                      <div className="text-xs text-white/40">
                        Last synced: {new Date(integration.lastSyncedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-white/10">
               <Button onClick={handleSaveIntegrations} disabled={saving}>
                 {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                 Save All Changes
               </Button>
            </div>
          </div>
        </div>
      )}

      {tab === "messages" && (
        <div className="dashboard-surface p-12 text-center text-white/40">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Messages will appear here once connected.</p>
        </div>
      )}
    </div>
  );
}
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">AI Manager context</div>
                <div className="text-sm text-white/60">
                  Host AI uses this listing’s calendar and booking data to answer availability questions,
                  prevent double bookings, and confirm stays accurately.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "calendar" && (
        <div className="dashboard-surface p-6 space-y-6">
          <div className="text-sm font-semibold text-white">External calendar links</div>
          <div className="grid gap-4">
            {(["airbnb", "booking", "mmt"] as ListingPlatform[]).map((platform) => {
              const integration = integrations.find((item) => item.platform === platform);
              return (
                <div key={platform} className="space-y-2">
                  <div className="text-xs text-white/50 uppercase tracking-wider">
                    Paste the calendar link from {platformLabels[platform]}
                  </div>
                  <input
                    value={integration?.externalIcalUrl || ""}
                    onChange={(event) => updateIntegrationUrl(platform, event.target.value)}
                    placeholder="https://example.com/calendar.ics"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  />
                  <div className="text-xs text-white/40">
                    We pull new bookings from this link into Nodebase.
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="text-xs text-white/50 uppercase tracking-wider">Nodebase public calendar link</div>
            <div className="flex items-center gap-2">
              <input
                value={nodebaseIcalUrl}
                readOnly
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70"
              />
              <button
                onClick={async () => {
                  if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(nodebaseIcalUrl);
                    setMessage("Calendar link copied.");
                  }
                }}
                className="px-3 py-2 rounded-lg border border-white/20 text-white text-xs font-semibold"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-white/50">
              Copy this link and paste it into Airbnb or Booking.com to sync bookings from Nodebase.
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/50">
            <span>Sync status: {syncStatus}</span>
            <span>•</span>
            <span>Last synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Never"}</span>
          </div>

          {message && <div className="text-xs text-white/60">{message}</div>}

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard/kaisa/listings")}
              className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleSaveIntegrations}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Calendar Links"}
            </button>
          </div>
        </div>
      )}

      {tab === "messages" && (
        <div className="dashboard-surface p-6 text-white/60 flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-white/30" />
          Messages related to this listing will appear in Inbox.
        </div>
      )}
    </div>
  );
}
