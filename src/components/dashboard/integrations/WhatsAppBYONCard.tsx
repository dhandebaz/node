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
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'generating' | 'scanning' | 'connected'>(
    initialStatus?.status === 'active' ? 'connected' : 'idle'
  );

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
    <div className="col-span-full glass-card rounded-xl overflow-hidden mb-6 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#25D366]/10 rounded-lg">
              <Smartphone className="w-8 h-8 text-[#25D366]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">WhatsApp (WAHA / Linked Devices)</h2>
              <div className="flex items-center gap-2 mt-1">
                {status === 'connected' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-muted-foreground border border-[var(--public-line)]">
                    <XCircle className="w-3 h-3" />
                    Not Connected
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm max-w-md">
            Scan a QR code to connect your existing WhatsApp number. 
            Note: This uses a browser-based session via WAHA.
          </p>
        </div>

        <div className="w-full md:w-[400px] bg-white/5 rounded-lg border border-[var(--public-line)] p-5 flex flex-col items-center justify-center min-h-[200px]">
          {status === 'connected' ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-foreground font-medium">AI is actively managing your WhatsApp</p>
            </div>
          ) : status === 'scanning' && qrCode ? (
            <div className="space-y-4 text-center w-full">
              <div className="bg-white p-4 rounded-lg inline-block">
                <Image
                  src={qrCode!}
                  alt="Scan WhatsApp QR"
                  width={192}
                  height={192}
                  className="w-48 h-48"
                  unoptimized
                />
              </div>
              <p className="text-xs text-muted-foreground">Open WhatsApp &gt; Linked Devices &gt; Link a Device</p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Waiting for scan...
              </div>
            </div>
          ) : (
            <Button 
              onClick={handleConnect} 
              className="bg-[#25D366] hover:bg-[#128C7E] text-[var(--public-ink)] font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating QR...
                </>
              ) : (
                "Generate QR Code"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
