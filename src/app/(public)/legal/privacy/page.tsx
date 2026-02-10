"use client";

import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
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
            {t("legal.privacy.title")}
          </h1>

          <div className="p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm">
            <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone hover:prose-a:text-white">
              <p className="lead text-xl text-brand-bone">
                At nodebase (a Chishti Ventures Private Limited company), we are committed to protecting the privacy and security of our users' data. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
              </p>

              <h3>1. Data Sovereignty & Residency</h3>
              <p>
                We process and store all sensitive user data exclusively within the territory of India. We are fully committed to compliance with the 
                <strong> Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>. Your data never leaves Indian soil without your explicit consent or a legal mandate from a competent Indian authority.
              </p>

              <h3>2. Information We Collect</h3>
              <ul>
                <li><strong>Business Information:</strong> Name, email, property details, and platform links (Airbnb/Booking.com) when you register.</li>
                <li><strong>Guest Data:</strong> Information you provide or that is synced from OTAs, including guest names, booking dates, and message history.</li>
                <li><strong>Identity Documents:</strong> Guest IDs collected for verification purposes. These are encrypted and stored securely.</li>
              </ul>

              <h3>3. AI Usage & Data Training</h3>
              <p>
                We value your trust and business confidentiality.
              </p>
              <ul>
                <li><strong>No Training on Your Data:</strong> We do NOT use your private guest conversations or business rules to train our public AI models.</li>
                <li><strong>Encryption:</strong> Guest IDs and sensitive booking details are encrypted at rest.</li>
                <li><strong>Context Isolation:</strong> Your AI Employee operates within a strict boundary, accessing only the data relevant to your specific business context.</li>
              </ul>

              <h3>4. How We Use Your Information</h3>
              <p>We use the collected data for the following purposes:</p>
              <ul>
                <li>To provide the AI Employee service (automating replies, managing calendar).</li>
                <li>To process payments and verify guest identities on your behalf.</li>
                <li>To prevent fraud and ensure platform safety.</li>
                <li>To comply with legal obligations under Indian law.</li>
              </ul>

              <h3>5. Data Security</h3>
              <p>
                We implement enterprise-grade security measures, including:
              </p>
              <ul>
                <li><strong>Encryption:</strong> Data is encrypted at rest (AES-256) and in transit (TLS 1.3).</li>
                <li><strong>Access Control:</strong> Strict role-based access control (RBAC) and Multi-Factor Authentication (MFA) for internal administrative access.</li>
                <li><strong>Physical Security:</strong> Our Tier-4 data center in <strong>Okhla, New Delhi, India</strong> features 24/7 physical security, biometric access control, and strict data isolation protocols.</li>
              </ul>

              <h3>6. Human Review & AI Limitations</h3>
              <p>
                To maintain privacy:
              </p>
              <ul>
                <li><strong>No Routine Human Review:</strong> Our team does not read your guest messages or business data unless explicitly requested by you for support, or if flagged by automated systems for severe safety violations (e.g., fraud, abuse).</li>
                <li><strong>AI Limitations:</strong> While our AI is advanced, it may occasionally generate incorrect responses. You retain full responsibility for reviewing critical actions.</li>
              </ul>

              <h3>7. Third-Party Sharing</h3>
              <p>
                We do not sell your personal data. We may share data with:
              </p>
              <ul>
                <li><strong>Service Providers:</strong> Payment processors (e.g., Razorpay, Stripe) strictly for billing purposes.</li>
                <li><strong>Legal Authorities:</strong> When required by a valid court order or government directive under Indian law.</li>
              </ul>

              <h3>8. Your Rights</h3>
              <p>
                Under the DPDP Act, you have the right to:
              </p>
              <ul>
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate or incomplete data.</li>
                <li>Request erasure of your data (Right to be Forgotten), subject to data retention laws.</li>
                <li>Withdraw consent for data processing at any time.</li>
              </ul>

              <h3>7. Contact Us</h3>
              <p>
                If you have questions about this Privacy Policy, please contact our Grievance Officer:
              </p>
              <div className="bg-brand-bone/10 p-6 rounded-xl border border-brand-bone/10 mt-4 not-prose">
                <p className="font-bold text-brand-bone">Grievance Officer</p>
                <p className="text-brand-bone/80">Chishti Ventures Private Limited</p>
                <p className="text-brand-bone/80">Okhla Industrial Estate, Phase III</p>
                <p className="text-brand-bone/80">New Delhi, India 110020</p>
                <p className="mt-2 text-brand-bone">Email: privacy@nodebase.space</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
