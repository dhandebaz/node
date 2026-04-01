"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Check, X, ExternalLink, RefreshCw, Copy, CheckCircle, AlertCircle, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type WhatsAppIntegration = {
  connected: boolean;
  phone_number_id?: string;
  business_account_id?: string;
};

interface WhatsAppBYONCardProps {
  initialStatus?: WhatsAppIntegration | null;
}

export function WhatsAppBYONCard({ initialStatus }: WhatsAppBYONCardProps) {
  const [integration, setIntegration] = useState<WhatsAppIntegration>(initialStatus || { connected: false });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchIntegration();
  }, []);

  const fetchIntegration = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/integrations/whatsapp");
      if (response.ok) {
        const data = await response.json();
        setIntegration(data);
      }
    } catch (error) {
      console.error("Failed to fetch WhatsApp status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!accessToken.trim() || !phoneNumberId.trim()) {
      setError("Both Access Token and Phone Number ID are required");
      return;
    }

    try {
      setConnecting(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/integrations/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken.trim(),
          phone_number_id: phoneNumberId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to connect");
        return;
      }

      setSuccess(`Connected successfully! Phone: ${data.phone_number}`);
      setIntegration({ connected: true, phone_number_id: phoneNumberId.trim() });
      setShowForm(false);
      setAccessToken("");
      setPhoneNumberId("");
      toast.success("WhatsApp connected successfully!");
    } catch (error) {
      setError("Failed to connect WhatsApp");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect WhatsApp?")) return;

    try {
      setLoading(true);
      const response = await fetch("/api/integrations/whatsapp", {
        method: "DELETE",
      });

      if (response.ok) {
        setIntegration({ connected: false });
        toast.success("WhatsApp disconnected");
      }
    } catch (error) {
      toast.error("Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="col-span-full glass-panel rounded-3xl overflow-hidden mb-8 relative border-emerald-500/20">
        <div className="p-8 flex items-center justify-center min-h-[200px]">
          <div className="animate-pulse space-y-4 w-full max-w-md">
            <div className="h-4 bg-white/5 rounded w-1/2"></div>
            <div className="h-8 bg-white/5 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-full glass-panel rounded-3xl overflow-hidden mb-8 relative border-emerald-500/20">
      <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start gap-8 relative">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#25D366]/10 rounded-2xl border border-emerald-500/20">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#25D366]" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                WhatsApp <span className="text-emerald-500/80">(Business API)</span>
              </h2>
              <div className="flex items-center gap-2 mt-2">
                {integration.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3.5 h-3.5" />
                    CONNECTED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-zinc-500 border border-white/10 italic">
                    <AlertCircle className="w-3.5 h-3.5" />
                    NOT CONNECTED
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
            Connect your official WhatsApp Business API account for reliable, scalable messaging with full Meta compliance.
          </p>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-500">{success}</p>
            </div>
          )}
        </div>

        <div className="w-full md:w-[400px] bg-white/[0.02] rounded-2xl border border-white/10 p-6 flex flex-col">
          {integration.connected ? (
            <div className="text-center space-y-4 flex-1 flex flex-col justify-center">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold text-lg">WhatsApp Active</p>
                <p className="text-zinc-500 text-sm">AI is managing your WhatsApp messages</p>
              </div>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          ) : showForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  <Key className="w-4 h-4 inline mr-1" />
                  Access Token
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAAxxxxxxxxxxxx..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-xs text-blue-200">
                  <strong>How to get credentials:</strong><br/>
                  1. Create a Meta Business App with WhatsApp product<br/>
                  2. Add the WhatsApp Business API to your app<br/>
                  3. Get your Access Token from the WhatsApp Business API settings<br/>
                  4. Copy the Phone Number ID from your WhatsApp Business account
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="border-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 flex-1 flex flex-col justify-center">
              <div className="w-20 h-20 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <MessageCircle className="w-10 h-10 text-[#25D366]" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold">Connect WhatsApp Business API</p>
                <p className="text-zinc-500 text-sm">Use official Meta API for reliable messaging</p>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_30px_rgba(37,211,102,0.3)]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Connect WhatsApp Business
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
