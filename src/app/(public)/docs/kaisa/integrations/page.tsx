"use client";

import { MessageCircle, Mail, Calendar, CreditCard, ShoppingBag, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

export default function Page() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone prose-code:text-brand-bone">
      <motion.div
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.h1 variants={fadeInUp} className="text-4xl font-bold text-brand-bone mb-6 uppercase tracking-tighter">Integrations</motion.h1>
        <motion.p variants={fadeInUp} className="lead text-xl text-brand-bone/60 mb-8">
          kaisa agents become powerful when connected to your business tools. We support a wide range of native integrations tailored for Indian businesses.
        </motion.p>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 mb-6 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Communication</motion.h2>
        <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-6 not-prose">
          
          <div className="flex items-start gap-4 p-6 glass-card rounded-xl border border-brand-bone/5 bg-brand-bone/5">
            <div className="bg-[#25D366]/20 p-3 rounded-lg text-[#25D366]">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-bone mb-1">WhatsApp Business</h3>
              <p className="text-sm text-brand-bone/60 mb-3">
                The primary interface for kaisa agents. Enable agents to read, reply, and manage WhatsApp conversations automatically.
              </p>
              <ul className="text-sm text-brand-bone/50 list-disc list-inside">
                <li>Automatic reply handling</li>
                <li>Template message sending</li>
                <li>Media handling (images/documents)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 glass-card rounded-xl border border-brand-bone/5 bg-brand-bone/5">
            <div className="bg-blue-500/20 p-3 rounded-lg text-blue-500">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-bone mb-1">Email (Gmail / Outlook)</h3>
              <p className="text-sm text-brand-bone/60 mb-3">
                Allow agents to draft, send, and categorize emails. Great for handling support tickets or vendor inquiries.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 mb-6 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Productivity & Scheduling</motion.h2>
        <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-6 not-prose">
          <div className="flex items-start gap-4 p-6 glass-card rounded-xl border border-brand-bone/5 bg-brand-bone/5">
            <div className="bg-orange-500/20 p-3 rounded-lg text-orange-500">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-bone mb-1">Google Calendar</h3>
              <p className="text-sm text-brand-bone/60 mb-3">
                Real-time slot checking and appointment booking. kaisa respects your "Busy" status and working hours.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 mb-6 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Payments (India Stack)</motion.h2>
        <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-6 not-prose">
          <div className="flex items-start gap-4 p-6 glass-card rounded-xl border border-brand-bone/5 bg-brand-bone/5">
            <div className="bg-indigo-500/20 p-3 rounded-lg text-indigo-500">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-bone mb-1">Razorpay & UPI</h3>
              <p className="text-sm text-brand-bone/60 mb-3">
                Generate payment links and verify transaction status.
              </p>
              <div className="bg-black/40 p-3 rounded text-xs font-mono text-brand-bone/60 border border-brand-bone/10">
                Agent: "I've booked your slot. Please pay ₹500 using this link: https://rzp.io/l/xxxxx"
              </div>
            </div>
          </div>
        </motion.div>

        <motion.h2 variants={fadeInUp} className="text-brand-bone mt-12 mb-6 uppercase tracking-wide text-lg border-b border-brand-bone/10 pb-2">Industry Specific</motion.h2>
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
          <div className="p-6 glass-card rounded-xl border border-brand-bone/5 bg-brand-bone/5">
             <div className="flex items-center gap-2 mb-3">
               <Stethoscope className="w-5 h-5 text-red-400" />
               <h3 className="font-bold text-brand-bone">Cowin / ABDM</h3>
             </div>
             <p className="text-sm text-brand-bone/60">
               For clinics: Verify vaccination status or link health records (requires ABDM compliance).
             </p>
          </div>

          <div className="p-6 glass-card rounded-xl border border-brand-bone/5 bg-brand-bone/5">
             <div className="flex items-center gap-2 mb-3">
               <ShoppingBag className="w-5 h-5 text-purple-400" />
               <h3 className="font-bold text-brand-bone">Shopify / WooCommerce</h3>
             </div>
             <p className="text-sm text-brand-bone/60">
               For retail: Check inventory, order status, and process returns.
             </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
