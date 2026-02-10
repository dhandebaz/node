"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
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
    <div className="flex flex-col w-full bg-brand-deep-red text-brand-bone selection:bg-brand-bone selection:text-brand-deep-red relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <NetworkBackground />
      </div>

      {/* SECTION 1: HERO */}
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
            Stop Paying<br />
            30% Commission.
          </motion.h1>
          
          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-8 md:mt-12 border-t border-brand-bone/20 pt-6 md:pt-8"
          >
            <div>
              <p className="text-editorial-body max-w-md text-white">
                Take bookings directly with your AI employee.
                <br/>
                <span className="text-white/60 text-lg mt-4 block">
                  Focused on direct bookings, payments, and control.
                </span>
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start justify-end">
              <Link 
                href="/login"
                className="group flex items-center gap-4 text-2xl font-semibold uppercase tracking-tight hover:gap-6 transition-all bg-white text-black px-8 py-4 rounded-full"
              >
                Get AI Employee <ArrowRight className="w-6 h-6" />
              </Link>
              <p className="text-sm text-white/50 mt-4 uppercase tracking-wider">No credit card required</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2: WHAT IT DOES */}
      <section className="min-h-auto md:min-h-screen flex flex-col justify-center px-6 py-16 md:py-24 border-b border-brand-bone/20 z-10 relative bg-brand-deep-red/90 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto w-full"
        >
          <h2 className="text-display-huge uppercase leading-[0.85] tracking-tighter mb-8 md:mb-12">
            Your Business,<br />Automated.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div className="border-t border-brand-bone/20 pt-6">
               <h3 className="text-xl font-bold uppercase tracking-widest mb-4">24/7 Guest Replies</h3>
               <p className="text-2xl leading-tight opacity-90">
                 Instant responses to inquiries, day or night. Never miss a potential booking.
               </p>
            </div>
            <div className="border-t border-brand-bone/20 pt-6">
               <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Direct Payments</h3>
               <p className="text-2xl leading-tight opacity-90">
                 Collect payments instantly via UPI or secure links. Money goes straight to your bank.
               </p>
            </div>
            <div className="border-t border-brand-bone/20 pt-6">
               <h3 className="text-xl font-bold uppercase tracking-widest mb-4">ID Verification</h3>
               <p className="text-2xl leading-tight opacity-90">
                 Securely collect and verify guest IDs before arrival. Safety first.
               </p>
            </div>
             <div className="border-t border-brand-bone/20 pt-6">
               <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Calendar Sync</h3>
               <p className="text-2xl leading-tight opacity-90">
                 Syncs perfectly with Airbnb, Booking.com, and MMT. No double bookings.
               </p>
            </div>
            <div className="border-t border-brand-bone/20 pt-6 md:col-span-2">
               <h3 className="text-xl font-bold uppercase tracking-widest mb-4 text-brand-bone">Zero Commission</h3>
               <p className="text-2xl leading-tight opacity-90">
                 Keep 100% of your direct booking revenue. We don't take a cut.
               </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3: COMPARISON */}
      <section className="min-h-auto flex flex-col justify-center px-6 py-16 md:py-24 border-b border-brand-bone/20 z-10 relative">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-display-large uppercase leading-[0.85] tracking-tighter mb-12">
            The Old Way vs. Nodebase
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="p-8 border border-brand-bone/20 bg-brand-bone/5 opacity-70">
              <h3 className="text-2xl font-bold uppercase tracking-widest mb-8 text-brand-bone/50">OTA Booking</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <span className="text-xl">15-30% Commission Fees</span>
                </li>
                <li className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <span className="text-xl">Delayed Payouts</span>
                </li>
                <li className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <span className="text-xl">Guest Control Owned by Platform</span>
                </li>
                <li className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <span className="text-xl">Confusing Coupon Logic</span>
                </li>
              </ul>
            </div>

            {/* Nodebase */}
            <div className="p-8 border-2 border-brand-bone bg-brand-bone/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-bone text-brand-deep-red px-4 py-1 font-bold text-xs uppercase">
                Recommended
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-widest mb-8 text-brand-bone">Nodebase</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-xl font-bold">0% Commission</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-xl font-bold">Instant Direct Payments</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-xl font-bold">You Own the Guest Relationship</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-xl font-bold">Full Control Over Rules</span>
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
            Get AI Employee <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
          </Link>
          <p className="mt-8 text-lg opacity-60">Join the waitlist for early access.</p>
        </div>
      </section>

    </div>
  );
}
