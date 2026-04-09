"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Coffee, MapPin, KeyRound, Wifi, Shirt, ArrowRight, ShieldAlert, BadgeCheck } from "lucide-react";
import Link from "next/link";
import AiConciergeChat from "@/components/guest/AiConciergeChat";

// Mock data fetcher for the guide
export default function DigitalWelcomeGuide() {
  const params = useParams<{ bookingId: string }>();
  const [isVerified, setIsVerified] = useState(false); // Simulated state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching the booking info and checking KYC state
    setTimeout(() => {
      setLoading(false);
      // Let's pretend it's verified for the sake of presentation
      setIsVerified(true);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto pb-40 scrollbar-hide">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop" 
            alt="Property Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-6 left-6 right-6 z-20">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-3">
              <MapPin className="w-3 h-3 text-white" />
              <span className="text-[10px] font-medium text-white tracking-widest uppercase">Goa, India</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
              Villa Serenity
            </h1>
            <p className="text-sm text-zinc-300 font-medium tracking-wide">
              Oct 12 - Oct 15 • 3 Nights
            </p>
          </div>
        </div>

        <div className="px-6 py-8 md:px-10 space-y-8">
          
          {/* Smart Lock Access Block */}
          <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 p-6 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-1">Check-in Access</h2>
                {isVerified ? (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                      <BadgeCheck className="w-4 h-4 text-green-400" />
                      ID Verification Complete
                    </div>
                    <div className="bg-black/50 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Smart Lock PIN</p>
                      <p className="text-3xl font-mono tracking-[0.5em] text-white">4928</p>
                    </div>
                    <p className="text-xs text-zinc-500">Press the # key after entering your PIN.</p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                     <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                      <ShieldAlert className="w-4 h-4" />
                      Action Required
                    </div>
                    <p className="text-sm text-zinc-400">Please complete your identity verification to reveal the smart lock PIN.</p>
                    <Link href={`/guest-id/${params?.bookingId}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition-colors mt-2">
                      Verify ID <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5 flex flex-col justify-between aspect-square">
              <Wifi className="w-6 h-6 text-zinc-300" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Wi-Fi</p>
                <p className="text-sm font-semibold text-white">Villa_Guest</p>
                <p className="text-xs text-primary font-mono mt-1">serenity123</p>
              </div>
            </div>
            <Link href={`/guide/${params?.bookingId}/store`} className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5 flex flex-col justify-between aspect-square hover:bg-zinc-900 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coffee className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Host Store</p>
                <p className="text-sm font-semibold text-white break-words">Order extras & early check-in</p>
              </div>
            </Link>
          </div>

          {/* House Rules */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">House Rules</h3>
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex gap-4">
                <Shirt className="w-5 h-5 text-zinc-500 shrink-0" />
                <div>
                  <p className="font-medium text-sm text-zinc-200">Washing Machine</p>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">Please clean the lint filter after each use. Detergent is under the sink.</p>
                </div>
              </div>
              <div className="h-px bg-white/5 w-full" />
              <div className="flex gap-4">
                <div className="w-5 h-5 flex items-center justify-center text-zinc-500 shrink-0 uppercase text-xs font-bold tracking-widest">
                  QQ
                </div>
                <div>
                  <p className="font-medium text-sm text-zinc-200">Quiet Hours</p>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">10:00 PM to 8:00 AM. Please respect the neighbors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AiConciergeChat bookingId={params?.bookingId} propertyName="Villa Serenity" />
    </>
  );
}
