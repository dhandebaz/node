"use client";

import {import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RefundPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20">
      
      <div className="relative z-10 pt-32 pb-24 px-6 container mx-auto max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-8 text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60">
            Legal
          </div>

          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-12 text-brand-bone">
            Refund Policy
          </h1>

          <div className="p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm">
            <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone hover:prose-a:text-white">
              <p className="lead text-xl text-brand-bone">
                At Nodebase, we are transparent about our billing and refund policies. Please read this policy carefully before purchasing a subscription or credits.
              </p>

              <h3>1. Subscription Cancellations</h3>
              <p>
                You may cancel your Nodebase subscription at any time via your account dashboard.
              </p>
              <ul>
                <li><strong>Effect of Cancellation:</strong> Cancellation will take effect at the end of the current billing cycle. You will retain access to the Service until the period for which you have paid expires.</li>
                <li><strong>No Prorated Refunds:</strong> We do not provide refunds or credits for any partial subscription periods or unused time.</li>
              </ul>

              <h3>2. AI Credits and Usage</h3>
              <p>
                Our platform uses a credit-based system for certain AI functionalities.
              </p>
              <ul>
                <li><strong>Non-Refundable:</strong> All purchases of AI Credits are final and non-refundable.</li>
                <li><strong>Usage:</strong> Credits are deducted as they are used by your AI Employee. We cannot refund credits for tasks that have already been processed by the AI system.</li>
              </ul>

              <h3>3. No Refunds for Used Services</h3>
              <p>
                Due to the costs associated with AI compute resources and infrastructure, we are unable to offer refunds for services that have already been utilized. This includes:
              </p>
              <ul>
                <li>Subscription time that has already elapsed.</li>
                <li>AI Credits that have been consumed.</li>
                <li>Setup fees or one-time charges.</li>
              </ul>

              <h3>4. Billing Disputes</h3>
              <p>
                If you believe you have been billed in error, please contact our support team within 30 days of the billing date. We will review your claim and, if an error is confirmed, issue a refund or credit to your account.
              </p>

              <h3>5. Contact Us</h3>
              <p>
                For any billing questions or to report a dispute, please contact us at support@nodebase.space.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
