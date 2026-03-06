"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsPage() {
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
            Terms of Service
          </h1>

          <div className="p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm">
            <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone hover:prose-a:text-white">
              <p className="lead text-xl text-brand-bone">
                Effective Date: March 6, 2026<br/>
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("User") and Nodebase Technologies Pvt. Ltd. ("Nodebase"), a company incorporated under the Companies Act, 2013, with its registered office in Bangalore, India.
              </p>

              <h3>1. Acceptance of Terms</h3>
              <p>
                By registering for or using our services, you agree to be bound by these Terms and our Privacy Policy. If you are using the Services on behalf of a business, you represent that you have the authority to bind that entity.
              </p>

              <h3>2. AI Employee Services</h3>
              <p>
                Nodebase provides automated AI agents ("Host AI", "Dukan AI", etc.) acting as intermediaries to facilitate your business communications.
              </p>
              <ul>
                <li><strong>Accuracy Disclaimer:</strong> While we strive for accuracy, AI models may occasionally hallucinate or provide incorrect information. You are responsible for verifying critical outputs.</li>
                <li><strong>Intermediary Status:</strong> Under Section 79 of the Information Technology Act, 2000, Nodebase acts as an intermediary. We are not responsible for the content generated or transmitted by users through our platform.</li>
              </ul>

              <h3>3. Payments and Billing</h3>
              <p>
                We use <strong>Razorpay</strong> as our primary payment gateway. By using our payment services, you agree to be bound by Razorpay's <a href="https://razorpay.com/terms/" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>.
              </p>
              <ul>
                <li><strong>Wallet System:</strong> Services are prepaid via a wallet system. Credits are deducted per AI interaction.</li>
                <li><strong>GST:</strong> All fees are exclusive of Goods and Services Tax (GST) unless stated otherwise. You will be issued a GST-compliant invoice if you provide a valid GSTIN.</li>
                <li><strong>Non-Refundable:</strong> Wallet top-ups are generally non-refundable except as provided in our Refund Policy.</li>
              </ul>

              <h3>4. User Obligations</h3>
              <p>You agree not to:</p>
              <ul>
                <li>Use the platform for any illegal purpose under Indian law (e.g., selling prohibited goods, fraud).</li>
                <li>Reverse engineer or attempt to extract the source code or model weights of our AI.</li>
                <li>Harass or abuse other users or our support staff.</li>
              </ul>

              <h3>5. Intellectual Property</h3>
              <p>
                All rights, title, and interest in the Nodebase platform, including its software, AI models, and branding, remain with Nodebase. You retain ownership of your customer data.
              </p>

              <h3>6. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by Indian law, Nodebase shall not be liable for any indirect, incidental, or consequential damages, including loss of profits or data, arising from your use of the service. Our total liability is limited to the amount paid by you in the 3 months preceding the claim.
              </p>

              <h3>7. Governing Law and Jurisdiction</h3>
              <p>
                These Terms shall be governed by the laws of India. Any disputes arising out of these Terms shall be subject to the exclusive jurisdiction of the courts in <strong>Bangalore, Karnataka</strong>.
              </p>

              <h3>8. Contact Us</h3>
              <p>
                For legal notices or questions, please contact us at legal@nodebase.space.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
