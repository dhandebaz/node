"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Smartphone, CheckCircle2, XCircle } from "lucide-react";
import { generateWhatsAppQRAction, confirmWhatsAppScanAction } from "@/app/actions/whatsapp";
import { toast } from "sonner";
import { Integration } from "@/types";

interface WhatsAppBYONCardProps {
  initialStatus?: Integration | null;
}

export function WhatsAppBYONCard({ initialStatus }: WhatsAppBYONCardProps) {
  // Map DB status to UI state if needed, or default to 'idle'
  // If integration exists and is 'active' or 'connected', we show connected state
  const isConnectedInitially = initialStatus?.status === 'active' || initialStatus?.status === 'connected';
  
  const [status, setStatus] = useState<'idle' | 'generating' | 'scanning' | 'connected'>(
    isConnectedInitially ? 'connected' : 'idle'
  );
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  // Sync with initialStatus when it loads
  useEffect(() => {
    if (initialStatus?.status === 'active' || initialStatus?.status === 'connected') {
      setStatus('connected');
    }
  }, [initialStatus]);

  const handleLinkDevice = async () => {
    try {
      setStatus('generating');
      const res = await generateWhatsAppQRAction();
      if (res.success && res.qrUrl) {
        setQrUrl(res.qrUrl);
        setStatus('scanning');
      }
    } catch (error) {
      toast.error("Failed to generate QR code");
      setStatus('idle');
    }
  };

  const handleDisconnect = () => {
    // For now, just reset UI state as disconnect action wasn't specified in requirements
    // In real app, we'd call a disconnect server action
    setStatus('idle');
    toast.success("Disconnected device");
  };

  // Simulation effect
  useEffect(() => {
    if (status === 'scanning') {
      const timer = setTimeout(async () => {
        try {
          await confirmWhatsAppScanAction();
          setStatus('connected');
          toast.success("WhatsApp Connected Successfully");
        } catch (error) {
          toast.error("Failed to confirm connection");
          setStatus('idle');
        }
      }, 6000); // 6 seconds delay

      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6 relative overflow-hidden">
      {/* Background Gradient for visual pop */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        {/* Left Side: Content */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-3 bg-[#25D366]/10 rounded-lg">
              <Smartphone className="w-8 h-8 text-[#25D366]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">WhatsApp Personal (BYON)</h2>
              <div className="flex items-center gap-2 mt-1">
                {status === 'connected' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Not Connected
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-zinc-400 max-w-lg leading-relaxed">
            Turn your existing WhatsApp into an AI agent. Zero Meta API fees. No business verification required.
            Connect your personal number to start automating replies instantly.
          </p>

          <div className="pt-2">
             {status === 'idle' && (
                <Button 
                  onClick={handleLinkDevice}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white font-medium px-6"
                >
                  Link Personal Device
                </Button>
             )}
             
             {status === 'generating' && (
                <Button disabled className="bg-zinc-800 text-zinc-400 cursor-not-allowed">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating QR...
                </Button>
             )}
             
             {status === 'scanning' && (
                <div className="text-[#25D366] font-medium animate-pulse flex items-center justify-center md:justify-start gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Waiting for scan...
                </div>
             )}

             {status === 'connected' && (
               <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                   <CheckCircle2 className="w-5 h-5" />
                   AI Agent is actively managing your WhatsApp inbox
                 </div>
                 <Button 
                    variant="ghost" 
                    onClick={handleDisconnect}
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-auto py-1 px-3 text-sm"
                  >
                    Disconnect
                 </Button>
               </div>
             )}
          </div>
        </div>

        {/* Right Side: QR Display Area */}
        <div className="shrink-0">
           {status === 'scanning' && qrUrl && (
             <div className="flex flex-col items-center space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="bg-white p-4 rounded-xl shadow-2xl relative group">
                 <img src={qrUrl} alt="Scan QR" className="w-48 h-48 md:w-56 md:h-56 mix-blend-multiply" />
                 
                 {/* Scan Line Animation */}
                 <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#25D366] shadow-[0_0_8px_#25D366] animate-[scan_2s_ease-in-out_infinite]" />
               </div>
               <div className="text-center space-y-1">
                 <p className="text-white font-medium text-sm animate-pulse">Open WhatsApp on your phone</p>
                 <p className="text-zinc-500 text-xs">Menu {'>'} Linked Devices {'>'} Scan QR</p>
               </div>
             </div>
           )}
           
           {status === 'idle' && (
             <div className="w-48 h-48 md:w-56 md:h-56 bg-zinc-950/50 rounded-xl border-2 border-dashed border-zinc-800 flex items-center justify-center">
                <Smartphone className="w-12 h-12 text-zinc-700" />
             </div>
           )}

           {status === 'connected' && (
             <div className="w-48 h-48 md:w-56 md:h-56 bg-green-500/10 rounded-xl border border-green-500/20 flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-green-500/20">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <p className="text-green-400 font-medium">Device Linked</p>
                <p className="text-green-500/60 text-xs mt-1">Ready for automation</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
