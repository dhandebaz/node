"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RefundPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20 bg-grid-pattern">
      
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
            Refund & Cancellation Policy
          </h1>

          <div className="p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm">
            <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone hover:prose-a:text-white">
              <p className="lead text-xl text-brand-bone">
                Effective Date: March 6, 2026<br/>
                Nodebase Technologies Pvt. Ltd. strives to ensure customer satisfaction. This policy outlines the terms for refunds and cancellations for our SaaS services.
              </p>

              <h3>1. Free Trial</h3>
              <p>
                We offer a 7-day free trial or limited free credits for new users. No charges are applied during this period. We encourage you to use this period to evaluate if our AI Employees meet your business needs.
              </p>

              <h3>2. Subscription Cancellations</h3>
              <p>
                You may cancel your monthly or annual subscription at any time via the dashboard.
              </p>
              <ul>
                <li><strong>Effect:</strong> Cancellation stops future auto-renewals. Your access continues until the end of the current paid term.</li>
                <li><strong>No Partial Refunds:</strong> We do not offer prorated refunds for the remaining days in a billing cycle once a renewal has been processed.</li>
              </ul>

              <h3>3. Wallet Credits (Prepaid)</h3>
              <p>
                Credits purchased for AI usage ("Top-ups") are generally <strong>non-refundable</strong> as they are allocated to server infrastructure immediately upon purchase.
              </p>
              <p>
                <strong>Exception:</strong> If you believe a technical error caused an incorrect deduction of credits (e.g., system failure), please contact support within 7 days. We will audit the logs and restore credits if the error is verified.
              </p>

              <h3>4. Refund Timeline & Method</h3>
              <p>
                If a refund is approved by our team (e.g., for accidental double charges):
              </p>
              <ul>
                <li>Refunds will be processed to the <strong>original source of payment</strong> (Credit Card, UPI, or Net Banking).</li>
                <li>It typically takes <strong>5-7 business days</strong> for the amount to reflect in your bank account, depending on your bank's processing times.</li>
              </ul>

              <h3>5. Chargebacks</h3>
              <p>
                Initiating a chargeback with your bank without first contacting our support team will result in the immediate suspension of your account. We reserve the right to contest chargebacks with evidence of service usage.
              </p>

              <h3>6. Contact for Refunds</h3>
              <p>
                To request a refund or report a billing issue, please email billing@nodebase.space with your Transaction ID and Registered Phone Number.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
