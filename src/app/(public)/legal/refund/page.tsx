"use client";

import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function RefundPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <NetworkBackground />
      </div>

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
            {t("legal.refund.title")}
          </h1>

          <div className="p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm">
            <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone hover:prose-a:text-white">
              <p className="lead text-xl text-brand-bone">
                At nodebase, we strive to ensure customer satisfaction. However, due to the nature of digital infrastructure and compute resources, our refund policies are strictly defined below.
              </p>

              <h3>1. General Refund Policy</h3>
              <ul>
                <li><strong>Subscriptions:</strong> Monthly and annual subscriptions are non-refundable once the service period has commenced. You may cancel at any time to prevent future billing.</li>
                <li><strong>Prepaid Credits:</strong> Unused prepaid credits for kaisa AI or Nodebase Space are non-refundable and non-transferable, except where required by law.</li>
                <li><strong>Dedicated Servers:</strong> Setup fees for dedicated hardware are non-refundable.</li>
              </ul>

              <h3>2. 30-Day Money Back Guarantee (Shared Hosting)</h3>
              <p>
                For <strong>Nodebase Space Shared Hosting</strong> plans only, we offer a 30-day money-back guarantee. If you are not satisfied with the service, you may request a full refund within the first 30 days of your initial sign-up.
              </p>
              <p>This guarantee does <strong>not</strong> apply to:</p>
              <ul>
                <li>Domain name registrations.</li>
                <li>Dedicated servers or VPS instances.</li>
                <li>Add-on services (e.g., Dedicated IPs, Premium SSLs).</li>
                <li>Accounts terminated due to violation of our Terms of Service.</li>
              </ul>

              <h3>3. Service Failure Refunds</h3>
              <p>
                If you experience downtime exceeding our Service Level Agreement (SLA) limits, you are eligible for service credits as defined in our <Link href="/legal/sla">SLA</Link>. 
                In cases of catastrophic service failure where data is permanently lost due to our negligence, we may, at our sole discretion, issue a pro-rated refund for the affected billing period.
              </p>

              <h3>4. Cancellation Process</h3>
              <p>
                To cancel a service, please log in to your dashboard and navigate to the billing section. Cancellation requests must be submitted at least 24 hours before the renewal date to avoid automatic charges.
              </p>

              <h3>5. Contact for Refunds</h3>
              <p>
                To request a refund under the 30-day guarantee or for billing disputes, please contact our billing team:
              </p>
              <div className="bg-brand-bone/10 p-6 rounded-xl border border-brand-bone/10 mt-4 not-prose">
                <p className="text-brand-bone font-bold">billing@nodebase.space</p>
                <p className="text-sm mt-2 text-brand-bone/60">Please include your Account ID and Transaction Reference Number.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
