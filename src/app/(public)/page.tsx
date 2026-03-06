"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
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
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone selection:bg-brand-bone/20 overflow-x-hidden font-sans bg-grid-pattern">
      
      {/* HERO SECTION */}
      <section className="min-h-[90vh] flex flex-col justify-center px-6 pt-32 pb-16 relative border-b border-brand-bone/20 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-deep-red/90 pointer-events-none" />
        
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
              <div className="flex flex-col items-start justify-end">
                <Link 
                  href="/login"
                  className="group flex items-center gap-4 text-2xl font-semibold uppercase tracking-tight hover:gap-6 transition-all bg-white text-black px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Hire an AI <ArrowRight className="w-6 h-6" />
                </Link>
                <p className="text-sm text-white/50 mt-4 uppercase tracking-wider">No credit card required • Free Trial</p>
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
      <section className="min-h-auto md:min-h-screen flex flex-col justify-center px-6 py-16 md:py-24 border-b border-brand-bone/20 z-10 relative bg-brand-deep-red/95 backdrop-blur-sm">
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
            <div className="group border border-brand-bone/20 p-6 hover:bg-brand-bone/5 transition-colors relative flex flex-col">
               <div className="h-12 w-12 bg-blue-500/20 rounded-full mb-6 flex items-center justify-center border border-blue-500/30">
                 <span className="text-2xl">🏠</span>
               </div>
               <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Host AI</h3>
               <p className="text-brand-bone/70 mb-8 min-h-[3rem] text-sm">
                 For Airbnb hosts & property managers. Handles bookings & guest inquiries.
               </p>
               <div className="mt-auto">
                 <Link href="/employees/host-ai" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-brand-bone/30 pb-1 group-hover:border-brand-bone transition-colors">
                   View Details <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
            </div>

            {/* Dukan AI */}
            <div className="group border border-brand-bone/20 p-6 hover:bg-brand-bone/5 transition-colors relative flex flex-col">
               <div className="h-12 w-12 bg-green-500/20 rounded-full mb-6 flex items-center justify-center border border-green-500/30">
                 <span className="text-2xl">🛍️</span>
               </div>
               <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Dukan AI</h3>
               <p className="text-brand-bone/70 mb-8 min-h-[3rem] text-sm">
                 For local Kirana & WhatsApp selling. Automates orders & inventory.
               </p>
               <div className="mt-auto">
                 <Link href="/employees/dukan-ai" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-brand-bone/30 pb-1 group-hover:border-brand-bone transition-colors">
                   View Details <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
            </div>

            {/* Nurse AI */}
            <div className="group border border-brand-bone/20 p-6 hover:bg-brand-bone/5 transition-colors relative flex flex-col">
               <div className="h-12 w-12 bg-red-500/20 rounded-full mb-6 flex items-center justify-center border border-red-500/30">
                 <span className="text-2xl">🩺</span>
               </div>
               <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Nurse AI</h3>
               <p className="text-brand-bone/70 mb-8 min-h-[3rem] text-sm">
                 For clinics & doctors. Manages appointments & patient follow-ups.
               </p>
               <div className="mt-auto">
                 <Link href="/employees/nurse-ai" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-brand-bone/30 pb-1 group-hover:border-brand-bone transition-colors">
                   View Details <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
            </div>

            {/* Thrift AI */}
            <div className="group border border-brand-bone/20 p-6 hover:bg-brand-bone/5 transition-colors relative flex flex-col">
               <div className="h-12 w-12 bg-purple-500/20 rounded-full mb-6 flex items-center justify-center border border-purple-500/30">
                 <span className="text-2xl">👗</span>
               </div>
               <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Thrift AI</h3>
               <p className="text-brand-bone/70 mb-8 min-h-[3rem] text-sm">
                 For Instagram thrift stores. Handles DMs, payments & shipping.
               </p>
               <div className="mt-auto">
                 <Link href="/employees/thrift-ai" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-brand-bone/30 pb-1 group-hover:border-brand-bone transition-colors">
                   View Details <ArrowRight className="w-4 h-4" />
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
               <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-6">
                 Built for India.<br />Built for Scale.
               </h2>
               <p className="text-xl text-brand-bone/80 leading-relaxed mb-8">
                 Nodebase provides the intelligent infrastructure that powers the next generation of Indian businesses. From local shops to growing startups.
               </p>
               <ul className="space-y-4">
                 <li className="flex items-center gap-4">
                   <CheckCircle2 className="w-6 h-6 text-green-400" />
                   <span className="text-lg font-bold uppercase tracking-wide">Instant Setup (Under 2 mins)</span>
                 </li>
                 <li className="flex items-center gap-4">
                   <CheckCircle2 className="w-6 h-6 text-green-400" />
                   <span className="text-lg font-bold uppercase tracking-wide">WhatsApp First Integration</span>
                 </li>
                 <li className="flex items-center gap-4">
                   <CheckCircle2 className="w-6 h-6 text-green-400" />
                   <span className="text-lg font-bold uppercase tracking-wide">Pay-as-you-grow Pricing</span>
                 </li>
               </ul>
             </div>
             <div className="flex items-center justify-center">
               <div className="w-full aspect-square bg-brand-bone/5 border border-brand-bone/20 rounded-3xl flex items-center justify-center p-8">
                 <div className="text-center">
                   <p className="text-6xl font-bold mb-2">24/7</p>
                   <p className="text-xl uppercase tracking-widest opacity-60">Operations</p>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section className="py-32 px-6 border-t border-brand-bone/20 text-center bg-brand-deep-red">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-display-large uppercase tracking-tighter mb-8">
            Ready to hire your<br />first AI employee?
          </h2>
          <Link 
            href="/login"
            className="inline-flex items-center gap-4 text-xl font-bold uppercase tracking-tight bg-white text-black px-10 py-5 rounded-full hover:scale-105 transition-transform"
          >
            Get Started Now
          </Link>
        </div>
      </section>

    </div>
  );
}
