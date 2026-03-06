"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, MessageSquare, ShieldCheck, HelpCircle } from "lucide-react";

export default function PricingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20 bg-grid-pattern">
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
             No hidden fees. Just a flat monthly rate plus usage.
           </p>
         </motion.div>
       </div>
     </section>

     <section className="py-16 md:py-24 px-6 border-b border-brand-bone/10">
       <div className="container mx-auto max-w-6xl">
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
           {/* Base Subscription */}
           <div className="p-8 rounded-3xl border-2 border-brand-bone bg-brand-bone/10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 bg-brand-bone text-brand-deep-red px-4 py-1 font-bold text-xs uppercase">
                All Access
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4">Base Platform</h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold">₹1,999</span>
                <span className="text-lg font-normal opacity-60">/month</span>
              </div>
              <p className="text-xl opacity-80 mb-8">Your AI Employee's salary.</p>
              
              <ul className="space-y-6 mb-10">
                <li className="flex items-start gap-4">
                  <div className="p-1 bg-green-500/20 rounded-full mt-1">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-lg">Unlimited Properties/Stores</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-1 bg-green-500/20 rounded-full mt-1">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-lg">WhatsApp & Instagram Integration</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-1 bg-green-500/20 rounded-full mt-1">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-lg">Dashboard & Analytics</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-1 bg-green-500/20 rounded-full mt-1">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-lg">24/7 Availability</span>
                </li>
              </ul>

              <Link href="/login" className="block w-full text-center bg-brand-bone text-brand-deep-red font-bold py-4 rounded-full uppercase tracking-wider hover:bg-white transition-colors text-lg">
                Start Free Trial
              </Link>
              <p className="text-center text-sm opacity-50 mt-4">7-day free trial. No credit card required.</p>
           </div>

           {/* Usage Costs */}
           <div className="p-8 rounded-3xl border border-brand-bone/20 bg-brand-bone/5">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4">Usage Costs</h2>
              <p className="text-xl opacity-80 mb-8">Pay only for what you use.</p>
              
              <div className="space-y-8">
                <div className="flex gap-4 items-start border-b border-brand-bone/10 pb-6">
                   <div className="p-3 bg-brand-bone/10 rounded-lg">
                     <MessageSquare className="w-6 h-6 text-brand-bone" />
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-baseline mb-1">
                       <h3 className="font-bold text-lg">AI Reply</h3>
                       <span className="font-mono text-2xl font-bold text-brand-bone">₹1</span>
                     </div>
                     <p className="text-sm opacity-60 leading-relaxed">
                       Per automated response sent to a customer. Includes context understanding and memory retrieval.
                     </p>
                   </div>
                </div>

                <div className="flex gap-4 items-start border-b border-brand-bone/10 pb-6">
                   <div className="p-3 bg-brand-bone/10 rounded-lg">
                     <Zap className="w-6 h-6 text-brand-bone" />
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-baseline mb-1">
                       <h3 className="font-bold text-lg">Booking/Order</h3>
                       <span className="font-mono text-2xl font-bold text-brand-bone">₹0</span>
                     </div>
                     <p className="text-sm opacity-60 leading-relaxed">
                       We don't charge commission on your sales or bookings. You keep 100% of your revenue.
                     </p>
                   </div>
                </div>

                <div className="bg-brand-bone/5 p-6 rounded-xl border border-brand-bone/10">
                   <div className="flex gap-3 items-center mb-2">
                      <HelpCircle className="w-5 h-5 opacity-60" />
                      <h4 className="font-bold uppercase tracking-wide text-sm">How it works</h4>
                   </div>
                   <p className="text-sm opacity-60">
                     You top up your wallet (e.g., ₹500). As the AI replies to customers, ₹1 is deducted per message. If your balance hits zero, the AI pauses until you top up.
                   </p>
                </div>
              </div>
           </div>
         </div>
       </div>
     </section>
     
     <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-bold uppercase tracking-tight mb-8">Common Questions</h2>
        <div className="max-w-3xl mx-auto grid gap-8 text-left">
           <div className="bg-brand-bone/5 p-6 rounded-xl border border-brand-bone/10">
              <h3 className="font-bold text-lg mb-2">What happens if I run out of balance?</h3>
              <p className="opacity-70">The AI will stop replying. You will get a notification to top up. You can manually reply to customers in the meantime.</p>
           </div>
           <div className="bg-brand-bone/5 p-6 rounded-xl border border-brand-bone/10">
              <h3 className="font-bold text-lg mb-2">Can I set a spending limit?</h3>
              <p className="opacity-70">Yes, you can set a daily or monthly budget in your dashboard to control costs.</p>
           </div>
           <div className="bg-brand-bone/5 p-6 rounded-xl border border-brand-bone/10">
              <h3 className="font-bold text-lg mb-2">Is there a setup fee?</h3>
              <p className="opacity-70">No. Setup is free and takes less than 2 minutes.</p>
           </div>
        </div>
     </section>
    </div>
  );
}
