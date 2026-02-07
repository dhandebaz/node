"use client";

import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageSquare, Calendar, CreditCard, UserCheck, CheckCircle2 } from "lucide-react";
import { VisualFlow } from "@/components/products/manager/VisualFlow";
import { CentralCalendar } from "@/components/products/manager/CentralCalendar";
import { WalletDemo } from "@/components/products/manager/WalletDemo";

export default function ManagerPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const capabilities = [
    {
      title: "Guest Inbox",
      desc: "Auto-replies to inquiries 24/7 across Airbnb & Booking.com.",
      icon: MessageSquare,
      api: "GET /messages"
    },
    {
      title: "Availability Sync",
      desc: "Prevents double bookings by syncing calendars instantly.",
      icon: Calendar,
      api: "GET /calendar"
    },
    {
      title: "Payment Links",
      desc: "Collects deposits or extra charges directly via UPI/Card.",
      icon: CreditCard,
      api: "POST /payments/link"
    },
    {
      title: "ID Collection",
      desc: "Automatically requests and verifies guest IDs before check-in.",
      icon: UserCheck,
      api: "POST /guests/:id/upload-id"
    }
  ];

  const integrations = [
    { name: "Airbnb", src: "/images/integrations/airbnb.png" },
    { name: "Booking.com", src: "/images/integrations/booking.png" },
    { name: "WhatsApp", src: "/images/integrations/whatsapp.png" },
    { name: "Instagram", src: "/images/integrations/instagram.png" },
    { name: "Google", src: "/images/integrations/google.png" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone selection:bg-brand-bone/20 overflow-x-hidden font-sans">
      
      {/* SECTION 1: HERO */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-30">
          <NetworkBackground />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="flex justify-center mb-8">
              <span className="px-4 py-1.5 rounded-full border border-brand-bone/10 bg-brand-bone/5 text-xs font-mono tracking-widest text-brand-bone/60 uppercase">
                AI Manager for Airbnb Hosts
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-brand-bone leading-[1.1] mb-6"
            >
              Run Your Airbnb on Autopilot.
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl sm:text-2xl text-brand-silver mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              One AI Manager handles guest conversations, availability, payments, and IDs.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link 
                href="/login?method=google" 
                className="w-full sm:w-auto px-8 py-4 bg-brand-bone text-brand-deep-red rounded-full font-medium transition-all hover:bg-white hover:scale-[0.98] active:scale-[0.96] flex items-center justify-center gap-2"
              >
                <span>Start with Google</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="#how-it-works" 
                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-brand-bone/20 text-brand-bone rounded-full font-medium transition-all hover:bg-brand-bone/5 flex items-center justify-center gap-2"
              >
                <span>See how it works</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: WHAT IT DOES */}
      <section id="how-it-works" className="py-32 border-t border-brand-bone/5 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((cap, i) => (
              <div key={i} className="p-8 rounded-2xl bg-brand-bone/5 border border-brand-bone/10 hover:border-brand-bone/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-brand-deep-red flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <cap.icon className="w-6 h-6 text-brand-bone" />
                </div>
                <h3 className="text-xl font-bold mb-3">{cap.title}</h3>
                <p className="text-brand-bone/60 mb-6 leading-relaxed">{cap.desc}</p>
                <div className="pt-4 border-t border-brand-bone/5">
                  <code className="text-[10px] font-mono text-brand-bone/30 bg-black/20 px-2 py-1 rounded">
                    {cap.api}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: VISUAL FLOW */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Real-Time Operations</h2>
            <p className="text-brand-bone/60 max-w-xl mx-auto">
              Watch how the AI handles a complete guest lifecycle, mapping to real API endpoints.
            </p>
          </div>
          <VisualFlow />
        </div>
      </section>

      {/* SECTION 4: CENTRAL CALENDAR */}
      <section className="py-32 bg-black/10 border-y border-brand-bone/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
               <h2 className="text-4xl font-bold mb-6">Centralized Calendar</h2>
               <p className="text-brand-bone/60 text-lg mb-8 leading-relaxed">
                 Manage bookings from Airbnb, Booking.com, and direct walk-ins in one place. 
                 Real-time sync prevents double bookings.
               </p>
               <ul className="space-y-4 mb-8">
                 {[
                   "Syncs with iCal instantly",
                   "Blocks dates across all platforms",
                   "Supports manual offline bookings"
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-green-400" />
                     <span className="text-brand-bone/80">{item}</span>
                   </li>
                 ))}
               </ul>
            </div>
            <div className="w-full md:w-1/2">
              <CentralCalendar />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: PAYMENTS & WALLET */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="w-full md:w-1/2">
               <h2 className="text-4xl font-bold mb-6">Integrated Wallet</h2>
               <p className="text-brand-bone/60 text-lg mb-8 leading-relaxed">
                 Track your earnings and AI usage credits. Seamlessly integrated with local payment gateways.
               </p>
               <div className="p-6 rounded-xl bg-brand-bone/5 border border-brand-bone/10">
                 <h4 className="font-bold mb-2">Real Financial Logic</h4>
                 <p className="text-sm text-brand-bone/60 mb-4">
                   Every transaction is recorded with double-entry bookkeeping principles.
                 </p>
                 <code className="text-xs font-mono text-brand-bone/40 bg-black/20 px-2 py-1 rounded block w-fit">
                   GET /wallet/transactions
                 </code>
               </div>
            </div>
            <div className="w-full md:w-1/2">
              <WalletDemo />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: INTEGRATIONS */}
      <section className="py-24 border-t border-brand-bone/5 bg-black/40">
        <div className="container mx-auto px-6 text-center">
          <p className="text-brand-bone/40 uppercase tracking-widest text-sm font-mono mb-12">
            Seamlessly Integrated With
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {integrations.map((logo, i) => (
              <div key={i} className="relative w-16 h-16 sm:w-20 sm:h-20 transition-transform hover:scale-110">
                <Image 
                  src={logo.src} 
                  alt={logo.name} 
                  fill 
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
