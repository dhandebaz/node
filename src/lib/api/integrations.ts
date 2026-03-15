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
  /**
   * Fetch all integrations for the current tenant from the real backend.
   */
  getIntegrations: async (): Promise<Integration[]> => {
    try {
      const response = await apiClient.get("/api/integrations");
      const data: any[] = response.data?.integrations ?? response.data ?? [];
      return data.map(enrichWithMeta);
    } catch (err: any) {
      console.error("[integrationsApi] getIntegrations failed:", err?.message);
      // Return empty list instead of crashing the UI
      return [];
    }
  },

  /**
   * Connect an integration by provider ID.
   * For iCal-based platforms (airbnb, booking, vrbo) this expects a `url` in options.
   * For WhatsApp this starts a WAHA session and may return a QR code URL.
   * For Instagram/Google this initiates the OAuth flow.
   */
  connect: async (
    id: string,
    options?: { url?: string; listingId?: string },
  ): Promise<Integration> => {
    const response = await apiClient.post(
      `/api/integrations/${id}/connect`,
      options ?? {},
    );
    return enrichWithMeta({ provider: id, ...(response.data ?? {}) });
  },

  /**
   * Disconnect an integration by provider ID.
   */
  disconnect: async (id: string): Promise<void> => {
    await apiClient.post(`/api/integrations/${id}/disconnect`);
  },

  /**
   * Get the current status of a single integration.
   */
  getStatus: async (id: string): Promise<Integration | null> => {
    try {
      const response = await apiClient.get(`/api/integrations/${id}/status`);
      return enrichWithMeta({ provider: id, ...(response.data ?? {}) });
    } catch {
      return null;
    }
  },

  /**
   * Trigger a manual re-sync for a listing's connected iCal sources.
   */
  syncListing: async (listingId: string): Promise<{ syncedAt: string }> => {
    const response = await apiClient.post(
      `/api/listings/${listingId}/calendar`,
    );
    return response.data;
  },
};
