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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone selection:bg-brand-bone/20 overflow-x-hidden font-sans">
      
      {/* HERO SECTION */}
      <section className="min-h-[90vh] flex flex-col justify-center px-6 pt-32 pb-16 relative border-b border-brand-bone/20 z-10">
        <motion.div 
          initial="initial"
          animate="animate"
          variants={stagger}
          className="max-w-7xl mx-auto w-full"
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
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-8 md:mt-12 border-t border-brand-bone/20 pt-6 md:pt-8"
          >
            <div>
              <p className="text-editorial-body max-w-md text-white">
                Autonomous AI agents that handle your customer support, direct bookings, and daily operations 24/7.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start justify-end">
              <Link 
                href="/login"
                className="group flex items-center gap-4 text-2xl font-semibold uppercase tracking-tight hover:gap-6 transition-all bg-white text-black px-8 py-4 rounded-full"
              >
                Hire an AI <ArrowRight className="w-6 h-6" />
              </Link>
              <p className="text-sm text-white/50 mt-4 uppercase tracking-wider">No credit card required</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2: OUR EMPLOYEES */}
      <section className="min-h-auto md:min-h-screen flex flex-col justify-center px-6 py-16 md:py-24 border-b border-brand-bone/20 z-10 relative bg-brand-deep-red/90 backdrop-blur-sm">
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
            <div className="group border border-brand-bone/20 p-6 hover:bg-brand-bone/5 transition-colors relative">
               <div className="h-12 w-12 bg-blue-500/20 rounded-full mb-6 flex items-center justify-center">
                 <span className="text-2xl">🏠</span>
               </div>
               <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Host AI</h3>
               <p className="text-brand-bone/70 mb-8 min-h-[3rem]">
                 For Airbnb hosts & property managers.
               </p>
               <Link href="/employees/host-ai" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-brand-bone/30 pb-1 group-hover:border-brand-bone transition-colors">
                 View Details <ArrowRight className="w-4 h-4" />
               </Link>
            </div>

            {/* Dukan AI */}
            <div className="group border border-brand-bone/20 p-6 hover:bg-brand-bone/5 transition-colors relative">
               <div className="h-12 w-12 bg-green-500/20 rounded-full mb-6 flex items-center justify-center">
                 <span className="text-2xl">🛍️</span>
               </div>
               <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Dukan AI</h3>
               <p className="text-brand-bone/70 mb-8 min-h-[3rem]">
                 For local Kirana & WhatsApp selling.
               </p>
               <Link href="/employees/dukan-ai" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-brand-bone/30 pb-1 group-hover:border-brand-bone transition-colors">
                 View Details <ArrowRight className="w-4 h-4" />
               </Link>
            </div>

            {/* Nurse AI */}
            <div className="group border border-brand-bone/20 p-6 hover:bg-brand-bone/5 transition-colors relative">
               <div className="h-12 w-12 bg-red-500/20 rounded-full mb-6 flex items-center justify-center">
                 <span className="text-2xl">⚕️</span>
               </div>
               <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Nurse AI</h3>
               <p className="text-brand-bone/70 mb-8 min-h-[3rem]">
                 For Doctor appointment scheduling.
               </p>
               <Link href="/employees/nurse-ai" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-brand-bone/30 pb-1 group-hover:border-brand-bone transition-colors">
                 View Details <ArrowRight className="w-4 h-4" />
               </Link>
            </div>

            {/* Thrift AI */}
            <div className="group border border-brand-bone/20 p-6 hover:bg-brand-bone/5 transition-colors relative">
               <div className="h-12 w-12 bg-purple-500/20 rounded-full mb-6 flex items-center justify-center">
                 <span className="text-2xl">👗</span>
               </div>
               <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Thrift AI</h3>
               <p className="text-brand-bone/70 mb-8 min-h-[3rem]">
                 For Instagram resale & DM management.
               </p>
               <Link href="/employees/thrift-ai" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-brand-bone/30 pb-1 group-hover:border-brand-bone transition-colors">
                 View Details <ArrowRight className="w-4 h-4" />
               </Link>
            </div>

          </div>
        </motion.div>
      </section>

      {/* SECTION 3: COMPARISON */}
      <section className="min-h-auto flex flex-col justify-center px-6 py-16 md:py-24 border-b border-brand-bone/20 z-10 relative">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-display-large uppercase leading-[0.85] tracking-tighter mb-12">
            Traditional Staff<br />vs. Nodebase AI
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="p-8 border border-brand-bone/20 bg-brand-bone/5 opacity-70">
              <h3 className="text-2xl font-bold uppercase tracking-widest mb-8 text-brand-bone/50">Human Staff / OTAs</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <span className="text-xl">High Monthly Salaries</span>
                </li>
                <li className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <span className="text-xl">8-Hour Work Shifts</span>
                </li>
                <li className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <span className="text-xl">Slow Response Times</span>
                </li>
                <li className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <span className="text-xl">High Training Costs</span>
                </li>
              </ul>
            </div>

            {/* Nodebase */}
            <div className="p-8 border-2 border-brand-bone bg-brand-bone/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-bone text-brand-deep-red px-4 py-1 font-bold text-xs uppercase">
                Recommended
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-widest mb-8 text-brand-bone">Nodebase AI</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-xl font-bold">Fraction of the cost</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-xl font-bold">24/7 Instant Replies</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-xl font-bold">Zero Commission on Sales</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-xl font-bold">Multilingual Support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA */}
       <section className="min-h-[60vh] flex flex-col justify-center px-6 py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto w-full text-center">
          <h2 className="text-display-huge uppercase leading-[0.85] tracking-tighter mb-8 md:mb-12">
            Ready to<br />Start?
          </h2>
          
          <Link 
            href="/login"
            className="inline-flex items-center gap-6 text-3xl md:text-5xl font-bold uppercase tracking-tighter border-b-4 border-brand-bone pb-2 hover:gap-8 transition-all hover:text-brand-bone/80 hover:border-brand-bone/80"
          >
            Hire an AI <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
          </Link>
          <p className="mt-8 text-lg opacity-60">Join the waitlist for early access.</p>
        </div>
      </section>

    </div>
  );
}
