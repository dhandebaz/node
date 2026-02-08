"use client";

import { useEffect, useMemo, useState } from "react";
import { Plug, Mail, Instagram, MessageSquare, Facebook, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Unlink2 } from "lucide-react";
import { cn } from "@/lib/utils";

type IntegrationProvider = "instagram" | "whatsapp" | "facebook";
type IntegrationStatus = "coming_soon";

type ProviderConfig = {
  id: IntegrationProvider;
  title: string;
  description: string;
  icon: React.ElementType;
  status: IntegrationStatus;
};

const providers: ProviderConfig[] = [
  {
    id: "instagram",
    title: "Instagram",
    description: "Connect Instagram DMs for social selling and guest inquiries.",
    icon: Instagram,
    status: "coming_soon"
  },
  {
    id: "whatsapp",
    title: "WhatsApp Business",
    description: "Send booking confirmations and updates via WhatsApp.",
    icon: MessageSquare,
    status: "coming_soon"
  },
  {
    id: "facebook",
    title: "Facebook Business",
    description: "Respond to customer messages through Facebook.",
    icon: Facebook,
    status: "coming_soon"
  }
];

type GoogleStatus = {
  status: "connected" | "disconnected" | "expired" | "error";
  services: { gmail: boolean; calendar: boolean; business: boolean };
  connectedEmail: string | null;
  connectedName: string | null;
  lastSyncedAt: string | null;
  expiresAt: string | null;
  errorCode: string | null;
};

export default function IntegrationsPage() {
  const [notice, setNotice] = useState<string | null>(null);
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(true);
  const [showConsent, setShowConsent] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadGoogleStatus = async () => {
    try {
      setLoadingGoogle(true);
      const response = await fetch("/api/integrations/google/status", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch Google status");
      }
      const data = await response.json();
      setGoogleStatus(data);
    } catch (error) {
      setNotice("Failed to load Google integration status.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  useEffect(() => {
    loadGoogleStatus();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("google");
    if (!status) return;
    const messageMap: Record<string, string> = {
      connected: "Google connected successfully.",
      state_mismatch: "Google connection failed due to a security check. Please try again.",
      missing_config: "Google connection is not configured. Contact support.",
      token_error: "Google connection failed while requesting tokens.",
      save_error: "Google connection succeeded, but we could not save the connection."
    };
    setNotice(messageMap[status] || "Google connection flow finished.");
    window.history.replaceState({}, "", "/dashboard/integrations");
  }, []);

  const handleConnect = (provider: ProviderConfig) => {
    if (provider.status === "coming_soon") {
      setNotice(`${provider.title} is coming soon. We'll notify you once it's ready.`);
      return;
    }
    setNotice("Connection setup will be available once integrations go live.");
  };

  const handleGoogleConnect = () => {
    setShowConsent(true);
  };

  const handleContinueToGoogle = async () => {
    try {
      setActionLoading(true);
      const response = await fetch("/api/integrations/google/connect", { method: "POST" });
      const payload = await response.json();
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Failed to initiate Google connection");
      }
      window.location.href = payload.url;
    } catch (error: any) {
      setNotice(error?.message || "Failed to start Google connection.");
      setActionLoading(false);
    }
  };

  const handleGoogleRefresh = async () => {
    try {
      setActionLoading(true);
      const response = await fetch("/api/integrations/google/refresh", { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to refresh Google access");
      }
      await loadGoogleStatus();
      setNotice("Google access refreshed.");
    } catch (error: any) {
      setNotice(error?.message || "Failed to refresh Google access.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      setActionLoading(true);
      const response = await fetch("/api/integrations/google/disconnect", { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to disconnect Google");
      }
      await loadGoogleStatus();
      setNotice("Google disconnected.");
    } catch (error: any) {
      setNotice(error?.message || "Failed to disconnect Google.");
    } finally {
      setActionLoading(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (loadingGoogle) return "Checking";
    if (!googleStatus) return "Disconnected";
    if (googleStatus.status === "expired") return "Expired";
    if (googleStatus.status === "connected") return "Connected";
    if (googleStatus.status === "error") return "Error";
    return "Disconnected";
  }, [googleStatus, loadingGoogle]);

  const statusTone = useMemo(() => {
    if (loadingGoogle) return "bg-white/10 text-white/60";
    if (googleStatus?.status === "connected") return "bg-emerald-500/10 text-emerald-300";
    if (googleStatus?.status === "expired") return "bg-amber-500/10 text-amber-300";
    if (googleStatus?.status === "error") return "bg-red-500/10 text-red-300";
    return "bg-white/10 text-white/70";
  }, [googleStatus, loadingGoogle]);

  const lastSyncedLabel = googleStatus?.lastSyncedAt
    ? new Date(googleStatus.lastSyncedAt).toLocaleString()
    : "Not synced yet";

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold mb-2 uppercase tracking-tight text-white">Integrations</h1>
        <p className="text-white/60">Connect core business context so your AI Manager understands guests, schedules, and operations.</p>
      </div>

      {notice && (
        <div className="dashboard-surface p-4 text-sm text-white/70 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5" />
          <div>{notice}</div>
        </div>
      )}

      {showConsent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Before you connect</h2>
              <p className="text-sm text-white/60">Nodebase will use your Google account to:</p>
            </div>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                read guest emails
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                sync your calendar
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                understand your business profile
              </li>
            </ul>
            <p className="text-sm text-white/60">
              This helps your AI Manager respond accurately and reduce manual work.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContinueToGoogle}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-white text-[var(--color-brand-red)] font-bold text-sm disabled:opacity-60"
              >
                Continue to Google
              </button>
              <button
                onClick={() => setShowConsent(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white/80 font-bold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="dashboard-surface p-6 flex flex-col justify-between lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Google Workspace / Google Account</h3>
                <p className="text-sm text-white/60">Email, calendar, and business context for your AI Manager.</p>
              </div>
            </div>
            <div className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", statusTone)}>
              {statusLabel}
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm text-white/70">
            <div className="grid gap-2">
              <div className="text-xs uppercase tracking-widest text-white/40">Connected account</div>
              <div className="text-white">
                {googleStatus?.connectedEmail || "Not connected"}
                {googleStatus?.connectedName ? ` · ${googleStatus.connectedName}` : ""}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-xs uppercase tracking-widest text-white/40">Services enabled</div>
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-2">
                  {googleStatus?.services?.gmail ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <XCircle className="w-4 h-4 text-white/30" />
                  )}
                  Gmail
                </span>
                <span className="flex items-center gap-2">
                  {googleStatus?.services?.calendar ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <XCircle className="w-4 h-4 text-white/30" />
                  )}
                  Calendar
                </span>
                <span className="flex items-center gap-2">
                  {googleStatus?.services?.business ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <XCircle className="w-4 h-4 text-white/30" />
                  )}
                  Business Profile
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-xs uppercase tracking-widest text-white/40">Last synced</div>
              <div>{lastSyncedLabel}</div>
            </div>

            {googleStatus?.status === "expired" && (
              <div className="text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm">
                Access expired. Reconnect to restore Google data sync.
              </div>
            )}

            {googleStatus?.status === "error" && (
              <div className="text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm">
                Google access needs attention. Refresh or reconnect to recover.
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {googleStatus?.status === "connected" && (
              <>
                <button
                  onClick={handleGoogleRefresh}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[var(--color-brand-red)] text-sm font-bold"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh access
                </button>
                <button
                  onClick={handleGoogleDisconnect}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm font-bold"
                >
                  <Unlink2 className="w-4 h-4" />
                  Disconnect
                </button>
              </>
            )}

            {(googleStatus?.status === "disconnected" || googleStatus?.status === "expired" || googleStatus?.status === "error" || !googleStatus) && (
              <button
                onClick={handleGoogleConnect}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[var(--color-brand-red)] text-sm font-bold"
              >
                <Plug className="w-4 h-4" />
                Connect Google
              </button>
            )}
          </div>
        </div>

        {providers.map((provider) => (
          <div key={provider.id} className="dashboard-surface p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <provider.icon className="w-8 h-8 text-white" />
                </div>
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                    provider.status === "coming_soon"
                      ? "bg-white/10 text-white/50"
                      : "bg-white/10 text-white/80"
                  )}
                >
                  {provider.status === "coming_soon" ? "Coming soon" : "Disconnected"}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{provider.title}</h3>
              <p className="text-sm text-white/60 mb-6">{provider.description}</p>
            </div>

            <button
              onClick={() => handleConnect(provider)}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors",
                provider.status === "coming_soon"
                  ? "bg-white/10 text-white/60"
                  : "bg-white text-[var(--color-brand-red)] hover:bg-white/90"
              )}
            >
              <Plug className="w-4 h-4" />
              {provider.status === "coming_soon" ? "Coming soon" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
