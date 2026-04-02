"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels, getPersonaCapabilities } from "@/lib/business-context";
import { 
  ExternalLink, Plus, X, RefreshCw, Check, AlertCircle, 
  Settings, Trash2, Loader2, Link
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface ChannelCredential {
  id: string;
  listing_id: string;
  channel: string;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string;
  error_message: string | null;
}

interface Listing {
  id: string;
  title: string;
}

const CHANNELS = [
  { 
    id: "airbnb", 
    name: "Airbnb", 
    color: "bg-red-500", 
    description: "Import bookings via iCal URL from Airbnb host dashboard",
    website: "https://airbnb.com"
  },
  { 
    id: "booking", 
    name: "Booking.com", 
    color: "bg-blue-500", 
    description: "Import bookings via iCal from Booking.com extranet",
    website: "https://booking.com"
  },
  { 
    id: "mmt", 
    name: "MakeMyTrip", 
    color: "bg-orange-500", 
    description: "Import bookings via iCal from MakeMyTrip partner dashboard",
    website: "https://makemytrip.com"
  },
  { 
    id: "google", 
    name: "Google Calendar", 
    color: "bg-green-500", 
    description: "Two-way sync with Google Calendar via iCal",
    website: "https://calendar.google.com"
  },
  { 
    id: "Vrbo", 
    name: "Vrbo", 
    color: "bg-purple-500", 
    description: "Connect your Vrbo listings",
    website: "https://vrbo.com"
  },
  { 
    id: "expedia", 
    name: "Expedia", 
    color: "bg-pink-500", 
    description: "Sync with Expedia for global reach",
    website: "https://expedia.com"
  },
];

export default function ChannelsPage() {
  const { tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);
  const capabilities = getPersonaCapabilities(tenant?.businessType);

  const [credentials, setCredentials] = useState<ChannelCredential[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [connectForm, setConnectForm] = useState({
    apiKey: "",
    apiSecret: "",
    propertyId: "",
    username: "",
    password: ""
  });
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (tenant?.id) {
      loadData();
    }
  }, [tenant?.id]);

  const loadData = async () => {
    try {
      const credsData = await fetchWithAuth<{ credentials: ChannelCredential[] }>(`/api/channel-credentials?tenant_id=${tenant?.id}`);
      setCredentials(credsData.credentials || []);
      
      const listingsData = await fetchWithAuth<{ listings: Listing[] }>(`/api/listings?tenant_id=${tenant?.id}`);
      setListings(listingsData.listings || []);
      if (listingsData.listings?.length > 0) {
        setSelectedListing(listingsData.listings[0].id);
      }
    } catch (error) {
      console.error("Failed to load channel data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedChannel || !selectedListing) return;
    
    setConnecting(true);
    try {
      await fetchWithAuth<{ credential: ChannelCredential }>("/api/channel-credentials", {
        method: "POST",
        body: JSON.stringify({
          tenant_id: tenant?.id,
          listing_id: selectedListing,
          channel: selectedChannel,
          credentials: connectForm
        })
      });
      
      loadData();
      setShowConnectModal(false);
      setConnectForm({ apiKey: "", apiSecret: "", propertyId: "", username: "", password: "" });
    } catch (error) {
      console.error("Failed to connect channel:", error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (credId: string) => {
    try {
      await fetchWithAuth(`/api/channel-credentials/${credId}`, {
        method: "DELETE"
      });
      setCredentials(credentials.filter(c => c.id !== credId));
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const handleSync = async (credId: string, channel: string) => {
    setSyncing({ ...syncing, [credId]: true });
    try {
      const updated = await fetchWithAuth<{ credential: ChannelCredential }>(`/api/channel-credentials/${credId}/sync`, {
        method: "POST"
      });
      setCredentials(credentials.map(c => c.id === credId ? updated.credential : c));
    } catch (error) {
      console.error("Failed to sync:", error);
    } finally {
      setSyncing({ ...syncing, [credId]: false });
    }
  };

  const getChannelInfo = (channelId: string) => CHANNELS.find(c => c.id === channelId) || CHANNELS[0];
  const getListingTitle = (listingId: string) => listings.find(l => l.id === listingId)?.title || "Unknown";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <Check className="h-4 w-4 text-green-500" />;
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "syncing": return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <div className="w-2 h-2 rounded-full bg-gray-400" />;
    }
  };

  const connectedChannels = credentials.map(c => ({
    ...c,
    info: getChannelInfo(c.channel)
  }));

  const availableChannels = CHANNELS.filter(
    ch => !credentials.some(c => c.channel === ch.id && c.listing_id === selectedListing)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Channel Manager</h1>
          <p className="text-muted-foreground">Connect and sync with booking platforms</p>
        </div>
        <button
          onClick={() => setShowConnectModal(true)}
          disabled={listings.length === 0}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4 mr-2 inline" />
          Connect Channel
        </button>
      </div>

      {/* Property Selector */}
      {listings.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <label className="text-sm font-medium mb-2 block">Select Property</label>
          <select
            value={selectedListing}
            onChange={(e) => setSelectedListing(e.target.value)}
            className="bg-background border rounded-md px-3 py-2 text-sm w-full md:w-auto"
          >
            {listings.map(listing => (
              <option key={listing.id} value={listing.id}>{listing.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Connected Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectedChannels.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card border rounded-lg">
            <Link className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No channels connected</h3>
            <p className="text-muted-foreground mb-4">Connect your first channel to start syncing bookings</p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Connect Channel
            </button>
          </div>
        ) : (
          connectedChannels.map(cred => (
            <div key={cred.id} className="bg-card border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", cred.info.color)}>
                    <ExternalLink className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{cred.info.name}</h3>
                    <p className="text-sm text-muted-foreground">{getListingTitle(cred.listing_id)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDisconnect(cred.id)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(cred.sync_status)}
                    <span className="capitalize">{cred.sync_status}</span>
                  </div>
                </div>
                
                {cred.last_sync_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Sync</span>
                    <span>{format(parseISO(cred.last_sync_at), "MMM d, h:mm a")}</span>
                  </div>
                )}

                {cred.error_message && (
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600">
                    {cred.error_message}
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleSync(cred.id, cred.channel)}
                  disabled={syncing[cred.id]}
                  className="flex-1 px-3 py-2 text-sm border rounded-md hover:bg-muted flex items-center justify-center gap-2"
                >
                  <RefreshCw className={cn("h-4 w-4", syncing[cred.id] && "animate-spin")} />
                  Sync Now
                </button>
                <a
                  href={`/dashboard/ai/listings/${cred.listing_id}`}
                  className="px-3 py-2 text-sm border rounded-md hover:bg-muted flex items-center justify-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  iCal Settings
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Available Channels */}
      {availableChannels.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Available Channels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableChannels.map(channel => (
              <div key={channel.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", channel.color)}>
                    <ExternalLink className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{channel.name}</h3>
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-lg w-full max-w-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Connect Channel</h3>
              <button onClick={() => setShowConnectModal(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Select Property *</label>
                <select
                  value={selectedListing}
                  onChange={(e) => setSelectedListing(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                >
                  {listings.map(listing => (
                    <option key={listing.id} value={listing.id}>{listing.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Channel *</label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select a channel</option>
                  {CHANNELS.map(channel => (
                    <option key={channel.id} value={channel.id}>{channel.name}</option>
                  ))}
                </select>
              </div>

              {selectedChannel && (
                <>
                  <div>
                    <label className="text-sm font-medium">API Key / Property ID</label>
                    <input
                      type="text"
                      value={connectForm.apiKey || connectForm.propertyId}
                      onChange={(e) => setConnectForm({ 
                        ...connectForm, 
                        apiKey: e.target.value, 
                        propertyId: e.target.value 
                      })}
                      placeholder="Enter API key or property ID"
                      className="mt-1 w-full border rounded-md px-3 py-2"
                    />
                  </div>

                  {(selectedChannel === "booking" || selectedChannel === "mmt" || selectedChannel === "expedia") && (
                    <>
                      <div>
                        <label className="text-sm font-medium">Username</label>
                        <input
                          type="text"
                          value={connectForm.username}
                          onChange={(e) => setConnectForm({ ...connectForm, username: e.target.value })}
                          className="mt-1 w-full border rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Password</label>
                        <input
                          type="password"
                          value={connectForm.password}
                          onChange={(e) => setConnectForm({ ...connectForm, password: e.target.value })}
                          className="mt-1 w-full border rounded-md px-3 py-2"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={!selectedChannel || !selectedListing || connecting}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
