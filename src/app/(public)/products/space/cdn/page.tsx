"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function CdnPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone selection:bg-brand-bone/20 font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <NetworkBackground />
      </div>

      <div className="container mx-auto px-6 pt-32 pb-24 relative z-20">
        <Link 
          href="/space"
          className="inline-flex items-center text-brand-bone/60 hover:text-brand-bone transition-colors mb-8 group uppercase tracking-wider text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Space
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <div className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest bg-brand-bone/5 rounded-full">
            Edge Network
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-brand-bone mb-6 uppercase leading-none">
            Global Content<br/>Delivery
          </h1>
          <p className="text-xl sm:text-2xl text-brand-bone/60 max-w-2xl mx-auto font-light leading-relaxed">
            Optimized for Indian geography and networks with sub-10ms latency in major metros.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-brand-bone/5 backdrop-blur-md p-12 max-w-2xl mx-auto rounded-3xl text-center border border-brand-bone/10 shadow-2xl"
        >
          <div className="w-20 h-20 rounded-full bg-brand-saffron/10 flex items-center justify-center mx-auto mb-8 border border-brand-saffron/20">
            <span className="animate-pulse w-4 h-4 rounded-full bg-brand-saffron shadow-[0_0_20px_rgba(255,193,7,0.5)]"></span>
          </div>
          <h2 className="text-3xl font-bold text-brand-bone mb-4 uppercase tracking-tight">Coming Soon</h2>
          <p className="text-brand-bone/60 mb-10 text-lg">
            We are currently rolling out our edge network nodes across Mumbai, Delhi, and Bangalore. Join the waitlist to get early access.
          </p>
          <Link 
            href="/company/contact"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-brand-bone text-brand-deep-red font-bold hover:bg-white transition-all hover:scale-105 group gap-2 uppercase tracking-wide text-sm"
          >
            Contact Sales
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
