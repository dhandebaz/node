"use client";

import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsPage() {
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
            {t("legal.terms.title")}
          </h1>

          <div className="p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm">
            <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone hover:prose-a:text-white">
              <p className="lead text-xl text-brand-bone">
                Welcome to nodebase. By accessing or using our website, services, or products, you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy.
              </p>

              <h3>1. Acceptance of Terms</h3>
              <p>
                These Terms constitute a legally binding agreement between you ("User") and Chishti Ventures Private Limited ("nodebase", "we", "us"). 
                If you do not agree to these Terms, you must not access or use our Services.
              </p>

              <h3>2. Services Description</h3>
              <p>
                Nodebase provides AI-powered business automation services, including but not limited to:
              </p>
              <ul>
                <li><strong>AI Employee:</strong> An autonomous agent for managing guest communication, bookings, and payments.</li>
                <li><strong>Direct Booking Engine:</strong> Tools to collect payments and manage reservations directly.</li>
                <li><strong>Business Intelligence:</strong> Analytics and insights derived from your business data.</li>
              </ul>

              <h3>3. User Account & Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access 
                to your account. Nodebase will not be liable for any loss or damage arising from your failure to protect your account.
              </p>

              <h3>4. Payments, Credits, and Billing</h3>
              <ul>
                <li><strong>Subscription:</strong> Monthly or annual fees for access to the AI Employee platform.</li>
                <li><strong>Usage Credits:</strong> Prepaid credits used for AI actions (replies, ID verification, etc.). Credits do not expire but are non-refundable.</li>
                <li><strong>Taxes:</strong> All fees are exclusive of applicable taxes (GST), which will be charged additionally.</li>
              </ul>

              <h3>5. Acceptable Use</h3>
              <p>
                You agree not to use our services for any illegal or unauthorized purpose, including but not limited to:
              </p>
              <ul>
                <li>Sending unsolicited spam or harassment via the AI agent.</li>
                <li>Processing fraudulent bookings or payments.</li>
                <li>Violating the privacy rights of your guests (e.g., sharing ID proofs publicly).</li>
                <li>Reverse engineering the AI models or platform infrastructure.</li>
              </ul>
              <p>
                Violation of these rules will result in immediate termination of your account without refund.
              </p>

              <h3>6. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, Nodebase shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>

              <h3>7. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject 
                to the exclusive jurisdiction of the courts located in New Delhi, India.
              </p>

              <h3>8. Changes to Terms</h3>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or a prominent notice on our website. 
                Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
