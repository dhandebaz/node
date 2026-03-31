import apiClient from "./client";

export interface Integration {
  id: string;
  name: string;
  icon: string;
  status: "connected" | "disconnected" | "error" | "pending_qr" | "active";
  lastSync?: string;
  description: string;
  qrUrl?: string | null;
}

const INTEGRATION_META: Record<
  string,
  { name: string; icon: string; description: string }
> = {
  airbnb: {
    name: "Airbnb",
    icon: "/images/integrations/airbnb.png",
    description: "Syncs availability, bookings, and messages in real-time.",
  },
  booking: {
    name: "Booking.com",
    icon: "/images/integrations/booking.png",
    description: "Connect to sync calendar and reservations.",
  },
  vrbo: {
    name: "Vrbo",
    icon: "/images/integrations/vrbo.png",
    description: "Expand your reach to vacation rental travelers.",
  },
  whatsapp: {
    name: "WhatsApp",
    icon: "/images/integrations/whatsapp.png",
    description: "Automate guest communication via WhatsApp.",
  },
  instagram: {
    name: "Instagram",
    icon: "/images/integrations/instagram.png",
    description: "Respond to DMs and comments automatically.",
  },
  google: {
    name: "Google",
    icon: "/images/integrations/google.png",
    description: "Connect Gmail, Calendar, and Google Business.",
  },
};

function enrichWithMeta(raw: any): Integration {
  const meta = INTEGRATION_META[raw.provider ?? raw.id] ?? {
    name: raw.provider ?? raw.id ?? "Unknown",
    icon: "/images/integrations/default.png",
    description: "",
  };
  return {
    id: raw.provider ?? raw.id,
    name: raw.connected_name ?? meta.name,
    icon: meta.icon,
    description: meta.description,
    status: raw.status ?? "disconnected",
    lastSync: raw.last_synced_at ?? raw.lastSync ?? undefined,
    qrUrl: raw.qrUrl ?? null,
  };
}

export const integrationsApi = {
  getIntegrations: async (): Promise<Integration[]> => {
    try {
      const response = await apiClient.get("/api/integrations");
      const data: any[] = response.data?.integrations ?? response.data ?? [];
      return data.map(enrichWithMeta);
    } catch (err: any) {
      console.error("[integrationsApi] getIntegrations failed:", err?.message);
      return [];
    }
  },

  connect: async (
    id: string,
    options?: { url?: string; listingId?: string },
  ): Promise<Integration> => {
    let response;
    
    switch (id) {
      case "whatsapp":
        response = await apiClient.post("/api/integrations/whatsapp/connect", options ?? {});
        break;
      case "instagram":
        response = await apiClient.post("/api/integrations/instagram/connect", options ?? {});
        break;
      case "google":
        response = await apiClient.post("/api/integrations/google/connect", options ?? {});
        break;
      default:
        response = await apiClient.post("/api/integrations", { provider: id, ...options });
    }
    
    return enrichWithMeta({ provider: id, ...(response.data ?? {}) });
  },

  disconnect: async (id: string): Promise<void> => {
    switch (id) {
      case "whatsapp":
        await apiClient.post("/api/integrations/whatsapp/disconnect");
        break;
      case "instagram":
        await apiClient.post("/api/integrations/instagram/disconnect");
        break;
      case "google":
        await apiClient.post("/api/integrations/google/disconnect");
        break;
      default:
        await apiClient.delete(`/api/integrations?provider=${id}`);
    }
  },

  getStatus: async (id: string): Promise<Integration | null> => {
    try {
      let response;
      
      switch (id) {
        case "whatsapp":
          response = await apiClient.get("/api/integrations/whatsapp/status");
          break;
        case "instagram":
          response = await apiClient.get("/api/integrations/instagram/status");
          break;
        case "google":
          response = await apiClient.get("/api/integrations/google/status");
          break;
        default:
          response = await apiClient.get(`/api/integrations?provider=${id}`);
      }
      
      return enrichWithMeta({ provider: id, ...(response.data ?? {}) });
    } catch {
      return null;
    }
  },

  syncListing: async (listingId: string): Promise<{ syncedAt: string }> => {
    const response = await apiClient.post(`/api/listings/${listingId}/calendar`);
    return response.data;
  },
};
