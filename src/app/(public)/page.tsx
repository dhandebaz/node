"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

import { MockChatInterface } from "@/components/ui/MockChatInterface";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-red text-brand-bone selection:bg-brand-bone/20 overflow-x-hidden font-sans bg-grid-pattern selection:text-white">
      
      {/* HERO SECTION */}
      <section className="min-h-[90vh] flex flex-col justify-center px-6 pt-32 pb-16 relative border-b border-brand-bone/20 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-red/90 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="w-full"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-display-huge uppercase leading-[0.85] tracking-tighter mb-6 md:mb-8"
            >
              Hire AI Employees.<br />
              Run your business<br />
              on autopilot.
            </motion.h1>
            
            <motion.div 
              variants={fadeInUp}
              className="mt-8 md:mt-12 border-t border-brand-bone/20 pt-6 md:pt-8"
            >
              <div>
                <p className="text-editorial-body max-w-md text-white mb-8">
                  Autonomous AI agents that handle your customer support, direct bookings, and daily operations 24/7.
                </p>
              </div>
              <div className="flex flex-col items-start">
                <Link 
                  href="/login"
                  className="group flex items-center gap-4 text-2xl font-bold uppercase tracking-tight skeuo-button text-white px-10 py-5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                  Hire an AI <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
                </Link>
                <div className="flex items-center gap-2 mt-6 opacity-60">
                   <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-red bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                           U{i}
                        </div>
                      ))}
                   </div>
                   <p className="text-[10px] uppercase tracking-widest font-bold ml-2">500+ Businesses Already Hiring</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
             <div className="absolute -inset-4 bg-brand-bone/10 rounded-3xl blur-2xl" />
             <MockChatInterface />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: OUR EMPLOYEES */}
      <section className="min-h-auto md:min-h-screen flex flex-col justify-center px-6 py-16 md:py-24 border-b border-brand-bone/20 z-10 relative bg-brand-red/95 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto w-full"
        >
          <h2 className="text-display-huge uppercase leading-[0.85] tracking-tighter mb-8 md:mb-12">
            Meet Your New<br />Workforce.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
             {/* Host AI */}
             <div className="group skeuo-card p-8 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative flex flex-col border-white/5 bg-white/[0.03]">
                <div className="h-16 w-16 bg-blue-500/10 rounded-2xl mb-8 flex items-center justify-center border border-blue-500/20 skeuo-inset shadow-inner">
                  <span className="text-3xl">🏠</span>
                </div>
                <h3 className="text-3xl font-bold uppercase tracking-tight mb-3">Host AI</h3>
                <p className="text-brand-bone/60 mb-10 min-h-[3rem] text-sm leading-relaxed">
                  For Airbnb hosts & property managers. Autonomous guest communication & booking sync.
                </p>
                <div className="mt-auto">
                  <Link href="/employees/host-ai" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 border-white/10 pb-2 group-hover:border-white transition-all text-white/70 group-hover:text-white">
                    Explore Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
             </div>

             {/* Dukan AI */}
             <div className="group skeuo-card p-8 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative flex flex-col border-white/5 bg-white/[0.03]">
                <div className="h-16 w-16 bg-green-500/10 rounded-2xl mb-8 flex items-center justify-center border border-green-500/20 skeuo-inset shadow-inner">
                  <span className="text-3xl">🛍️</span>
                </div>
                <h3 className="text-3xl font-bold uppercase tracking-tight mb-3">Dukan AI</h3>
                <p className="text-brand-bone/60 mb-10 min-h-[3rem] text-sm leading-relaxed">
                  For local Kirana & WhatsApp selling. Automate orders, inventory & payments 24/7.
                </p>
                <div className="mt-auto">
                  <Link href="/employees/dukan-ai" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 border-white/10 pb-2 group-hover:border-white transition-all text-white/70 group-hover:text-white">
                    Explore Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
             </div>

             {/* Nurse AI */}
             <div className="group skeuo-card p-8 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative flex flex-col border-white/5 bg-white/[0.03]">
                <div className="h-16 w-16 bg-red-500/10 rounded-2xl mb-8 flex items-center justify-center border border-red-500/20 skeuo-inset shadow-inner">
                  <span className="text-3xl">🩺</span>
                </div>
                <h3 className="text-3xl font-bold uppercase tracking-tight mb-3">Nurse AI</h3>
                <p className="text-brand-bone/60 mb-10 min-h-[3rem] text-sm leading-relaxed">
                  For clinics & doctors. Professional appointment scheduling & patient follow-ups.
                </p>
                <div className="mt-auto">
                  <Link href="/employees/nurse-ai" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 border-white/10 pb-2 group-hover:border-white transition-all text-white/70 group-hover:text-white">
                    Explore Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
             </div>

             {/* Thrift AI */}
             <div className="group skeuo-card p-8 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative flex flex-col border-white/5 bg-white/[0.03]">
                <div className="h-16 w-16 bg-purple-500/10 rounded-2xl mb-8 flex items-center justify-center border border-purple-500/20 skeuo-inset shadow-inner">
                  <span className="text-3xl">👗</span>
                </div>
                <h3 className="text-3xl font-bold uppercase tracking-tight mb-3">Thrift AI</h3>
                <p className="text-brand-bone/60 mb-10 min-h-[3rem] text-sm leading-relaxed">
                  For Instagram sellers. Automated DM commerce, payment links & order tracking.
                </p>
                <div className="mt-auto">
                  <Link href="/employees/thrift-ai" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 border-white/10 pb-2 group-hover:border-white transition-all text-white/70 group-hover:text-white">
                    Explore Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
             </div>

          </div>
        </motion.div>
      </section>

      {/* SECTION 3: Why Choose Us */}
      <section className="py-24 px-6 relative bg-grid-pattern">
        <div className="max-w-7xl mx-auto w-full">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
             <div>
               <h2 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-8 leading-[0.9]">
                 Built for India.<br />Built for Scale.
               </h2>
               <p className="text-xl text-brand-bone/60 leading-relaxed mb-12 max-w-lg">
                 Nodebase provides the intelligent infrastructure that powers the next generation of Indian businesses. From local shops to global startups.
               </p>
               <ul className="space-y-6">
                 {[
                   "Instant Setup (Under 2 mins)",
                   "WhatsApp First Integration",
                   "Pay-as-you-grow Pricing"
                 ].map((text, i) => (
                   <li key={i} className="flex items-center gap-4 group">
                     <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center skeuo-inset border-white/10 group-hover:bg-green-500/20 transition-all">
                       <CheckCircle2 className="w-3 h-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-70 group-hover:opacity-100 transition-opacity">{text}</span>
                   </li>
                 ))}
               </ul>
             </div>
             <div className="flex items-center justify-center">
               <div className="w-full max-w-md aspect-square skeuo-inset flex items-center justify-center p-12 bg-black/20 border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-center relative z-10">
                    <p className="text-8xl font-bold mb-4 tracking-tighter">24/7</p>
                    <p className="text-xs uppercase tracking-[0.5em] opacity-40 font-bold">Autonomous Operations</p>
                  </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section className="py-40 px-6 border-t border-white/10 text-center bg-brand-deep-red relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-display-huge uppercase tracking-tighter mb-12 leading-[0.8] font-bold">
            Ready to hire your<br />first AI employee?
          </h2>
          <Link 
            href="/login"
            className="inline-flex items-center gap-6 text-2xl font-bold uppercase tracking-tight skeuo-button text-white px-12 py-6 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all"
          >
            Get Started Fast <ArrowRight className="w-8 h-8" />
          </Link>
          <p className="mt-8 text-[10px] uppercase tracking-[0.3em] opacity-40 font-bold">No Credit Card Required • Hire in 2 Minutes</p>
        </div>
      </section>

    </div>
  );
}
