"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, MessageSquare, ShieldCheck } from "lucide-react";

export default function PricingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20">
      <section className="pt-32 pb-12 px-6 border-b border-brand-bone/10">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial="initial" animate="animate" variants={fadeInUp}>
           <Link href="/" className="text-sm uppercase tracking-widest text-brand-bone/60 hover:text-brand-bone transition-colors">
             ← Return Home
           </Link>
           <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mt-6 mb-4">
             Simple, Honest Pricing
           </h1>
           <p className="text-xl md:text-2xl text-brand-silver max-w-3xl font-light leading-relaxed">
             Base Subscription + Usage Credits. Pay only when AI works for you.
           </p>
         </motion.div>
       </div>
     </section>

     <section className="py-16 md:py-24 px-6 border-b border-brand-bone/10">
       <div className="container mx-auto max-w-6xl">
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
           {/* Base Subscription */}
           <div className="p-8 rounded-3xl border-2 border-brand-bone bg-brand-bone/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-bone text-brand-deep-red px-4 py-1 font-bold text-xs uppercase">
                Most Popular
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4">Base Subscription</h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold">₹1,999</span>
                <span className="text-lg font-normal opacity-60">/month</span>
              </div>
              <p className="text-xl opacity-80 mb-8">Access to your AI Employee</p>
              
              <ul className="space-y-6 mb-10">
                <li className="flex items-start gap-4">
                  <div className="p-1 bg-green-500/20 rounded-full mt-1">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-lg">Unlimited Properties</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-1 bg-green-500/20 rounded-full mt-1">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-lg">All Integrations (Airbnb, Booking.com)</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-1 bg-green-500/20 rounded-full mt-1">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-lg">Direct Booking Engine (0% Commission)</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-1 bg-green-500/20 rounded-full mt-1">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <span className="text-lg font-bold">Includes 5,000 Credits</span>
                    <p className="text-sm opacity-60 mt-1">Enough for ~500 AI replies per month</p>
                  </div>
                </li>
              </ul>

              <Link href="/login" className="block w-full text-center bg-brand-bone text-brand-deep-red font-bold py-4 rounded-full uppercase tracking-wider hover:bg-white transition-colors text-lg">
                Start Free Trial
              </Link>
              <p className="text-center text-sm opacity-50 mt-4">No credit card required for trial</p>
           </div>

           {/* Usage Credits */}
           <div className="p-8 rounded-3xl border border-brand-bone/20 bg-brand-bone/5">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4">Usage Credits</h2>
              <p className="text-xl opacity-80 mb-8">Top up when you grow. Credits never expire.</p>
              
              <div className="space-y-8">
                <div className="flex gap-4 items-start border-b border-brand-bone/10 pb-6">
                   <div className="p-3 bg-brand-bone/10 rounded-lg">
                     <MessageSquare className="w-6 h-6 text-brand-bone" />
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-baseline mb-1">
                       <h3 className="font-bold text-lg">AI Reply</h3>
                       <span className="font-mono opacity-80">~10 Credits</span>
                     </div>
                     <p className="text-sm opacity-60 leading-relaxed">
                       Smart, context-aware responses to guest inquiries on Airbnb or WhatsApp.
                     </p>
                   </div>
                </div>
                
                <div className="flex gap-4 items-start border-b border-brand-bone/10 pb-6">
                   <div className="p-3 bg-brand-bone/10 rounded-lg">
                     <Zap className="w-6 h-6 text-brand-bone" />
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-baseline mb-1">
                       <h3 className="font-bold text-lg">AI Action</h3>
                       <span className="font-mono opacity-80">~20 Credits</span>
                     </div>
                     <p className="text-sm opacity-60 leading-relaxed">
                       Complex tasks like syncing calendars, modifying reservations, or processing payments.
                     </p>
                   </div>
                </div>

                <div className="flex gap-4 items-start">
                   <div className="p-3 bg-brand-bone/10 rounded-lg">
                     <ShieldCheck className="w-6 h-6 text-brand-bone" />
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-baseline mb-1">
                       <h3 className="font-bold text-lg">Fair Usage Guarantee</h3>
                     </div>
                     <p className="text-sm opacity-60 leading-relaxed">
                       We only charge for successful AI actions. If the AI fails or makes a mistake, the credits are refunded automatically.
                     </p>
                   </div>
                </div>
              </div>
           </div>
         </div>

       </div>
     </section>
    </div>
  );
}
