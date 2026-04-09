"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Coffee, MapPin, KeyRound, Wifi, Shirt, ArrowRight, ShieldAlert, BadgeCheck } from "lucide-react";
import Link from "next/link";
import AiConciergeChat from "@/components/guest/AiConciergeChat";

// Mock data fetcher for the guide
export default function ClientPortal() {
  const params = useParams<{ bookingId: string }>();
  const [isVerified, setIsVerified] = useState(false); // Simulated state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching context
    setTimeout(() => {
      setLoading(false);
      setIsVerified(true);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto pb-40 scrollbar-hide bg-white">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
            alt="Business Header" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-6 left-6 right-6 z-20 text-zinc-950">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 backdrop-blur-md border border-blue-600/20 mb-3">
              <BadgeCheck className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Verified Business</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-950 mb-2 uppercase">
              Project Dashboard
            </h1>
            <p className="text-sm text-zinc-500 font-bold tracking-wide uppercase">
              Reference: {params?.bookingId?.slice(0, 8) || "NB-772"}
            </p>
          </div>
        </div>

        <div className="px-6 py-8 md:px-10 space-y-8">
          
          {/* Access Details Block */}
          <div className="relative overflow-hidden rounded-3xl bg-zinc-50 border border-zinc-200 p-6 shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-inner">
                <KeyRound className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-zinc-950 mb-1 uppercase tracking-tight">Access Details</h2>
                {isVerified ? (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-wider">
                      <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      Verification Active
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2 font-black">Security Pass</p>
                      <p className="text-3xl font-mono tracking-[0.5em] text-zinc-950 font-black">4928</p>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">Use this code for any integrated security checkpoints.</p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                     <div className="flex items-center gap-2 text-xs text-orange-600 font-bold uppercase">
                      <ShieldAlert className="w-4 h-4" />
                      Action Required
                    </div>
                    <p className="text-sm text-zinc-600 font-medium leading-relaxed">Please complete your identity verification to reveal sensitive access details.</p>
                    <Link href={`/guest-id/${params?.bookingId}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors mt-2">
                      Complete Setup <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 flex flex-col justify-between aspect-square">
              <Wifi className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-black">Wi-Fi Connect</p>
                <p className="text-sm font-bold text-zinc-950 uppercase tracking-tight">Main_Office</p>
                <p className="text-xs text-blue-600 font-mono mt-1 font-bold italic">nodebase_vip</p>
              </div>
            </div>
            <Link href={`/guide/${params?.bookingId}/store`} className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 flex flex-col justify-between aspect-square hover:bg-blue-50 transition-all hover:border-blue-200 group">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coffee className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-black">Solutions</p>
                <p className="text-sm font-bold text-zinc-950 uppercase tracking-tight leading-tight">Order add-ons & extras</p>
              </div>
            </Link>
          </div>

          {/* Service Guidelines */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Service Guidelines</h3>
            <div className="bg-zinc-50/50 border border-zinc-200 rounded-3xl p-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-950 uppercase tracking-tight">Project Timeline</p>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-1">Updates are provided daily via WhatsApp and the project dashboard.</p>
                </div>
              </div>
              <div className="h-px bg-zinc-200 w-full" />
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-950 uppercase tracking-tight">Support Hours</p>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-1">Standard support is active Mon-Fri, 9:00 AM to 6:00 PM.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AiConciergeChat bookingId={params?.bookingId} propertyName="Project Dashboard" />
    </>
  );
}
