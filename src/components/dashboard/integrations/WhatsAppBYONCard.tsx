"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Smartphone, CheckCircle2, XCircle } from "lucide-react";
import { generateWhatsAppQRAction, checkWhatsAppStatusAction } from "@/app/actions/whatsapp";
import { toast } from "sonner";
import { Integration } from "@/types";

interface WhatsAppBYONCardProps {
  initialStatus?: Integration | null;
}

export function WhatsAppBYONCard({ initialStatus }: WhatsAppBYONCardProps) {
  const [qrCode, setQrCode] = useState<string | null>(initialStatus?.metadata?.qr_url || null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'generating' | 'scanning' | 'connected'>(() => {
    if (initialStatus?.status === 'active') return 'connected';
    if (initialStatus?.metadata?.qr_url) return 'scanning';
    return 'idle';
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (status === 'scanning') {
      intervalId = setInterval(async () => {
        try {
          const result = await checkWhatsAppStatusAction();
          if (result.connected) {
            setStatus('connected');
            setQrCode(null);
            toast.success("WhatsApp connected successfully!");
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setStatus('generating');
      const result = await generateWhatsAppQRAction();
      
      if (result.success && result.qrUrl) {
        setQrCode(result.qrUrl);
        setStatus('scanning');
      } else {
        toast.error("Failed to generate QR code");
        setStatus('idle');
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
      setStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-full glass-panel rounded-3xl overflow-hidden mb-8 relative border-emerald-500/20">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#25D366]/10 rounded-2xl border border-emerald-500/20">
              <Smartphone className="w-10 h-10 text-[#25D366]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">WhatsApp <span className="text-emerald-500/80">(Linked Devices)</span></h2>
              <div className="flex items-center gap-2 mt-2">
                {status === 'connected' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    CONNECTED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-zinc-500 border border-white/10 italic">
                    <XCircle className="w-3.5 h-3.5" />
                    NOT CONNECTED
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
            Scan a QR code to connect your existing WhatsApp number. 
            Automate replies and orders directly from your business number via Nodebase.
          </p>
        </div>

        <div className="w-full md:w-[400px] bg-white/[0.02] rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center min-h-[240px] relative overflow-hidden backdrop-blur-sm">
          {status === 'connected' ? (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold text-lg">Active Session</p>
                <p className="text-zinc-500 text-sm">AI is now managing your chats</p>
              </div>
            </div>
          ) : status === 'scanning' && qrCode ? (
            <div className="space-y-4 text-center w-full">
              <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl">
                <Image
                  src={qrCode!}
                  alt="Scan WhatsApp QR"
                  width={192}
                  height={192}
                  className="w-48 h-48"
                  unoptimized
                />
              </div>
              <p className="text-xs text-zinc-500 font-mono tracking-tighter uppercase">Settings &gt; Linked Devices &gt; Link a Device</p>
              <div className="flex items-center justify-center gap-2 text-xs text-emerald-500 font-bold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                WAITING FOR SCAN...
              </div>
            </div>
          ) : (
            <button 
              onClick={handleConnect} 
              className="button-primary w-full bg-[#25D366] hover:bg-[#128C7E] !shadow-[0_0_30px_rgba(37,211,102,0.3)] border-emerald-400/30"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Link WhatsApp"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
