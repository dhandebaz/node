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
                <li><strong>Personal Information:</strong> Name, email address, phone number, and billing information when you register for an account.</li>
                <li><strong>Usage Data:</strong> Server logs, IP addresses, device information, and interaction data to improve system performance and security.</li>
                <li><strong>Content Data:</strong> Files, databases, and application code you upload to our infrastructure. We do not access this content except for automated security scanning (malware detection) or backup purposes.</li>
              </ul>

              <h3>3. How We Use Your Information</h3>
              <p>We use the collected data for the following purposes:</p>
              <ul>
                <li>To provide, operate, and maintain our services (kaisa AI, Nodebase Space, Infrastructure).</li>
                <li>To process transactions and manage your account credits.</li>
                <li>To detect and prevent fraudulent or malicious activity.</li>
                <li>To comply with legal obligations under Indian law.</li>
              </ul>

              <h3>4. Data Security</h3>
              <p>
                We implement enterprise-grade security measures, including:
              </p>
              <ul>
                <li><strong>Encryption:</strong> Data is encrypted at rest (AES-256) and in transit (TLS 1.3).</li>
                <li><strong>Access Control:</strong> Strict role-based access control (RBAC) and Multi-Factor Authentication (MFA) for internal administrative access.</li>
                <li><strong>Physical Security:</strong> Our Tier-4 data center in <strong>Okhla, New Delhi, India</strong> features 24/7 physical security, biometric access control, and strict data isolation protocols.</li>
              </ul>

              <h3>5. Third-Party Sharing</h3>
              <p>
                We do not sell your personal data. We may share data with:
              </p>
              <ul>
                <li><strong>Service Providers:</strong> Payment processors (e.g., Razorpay, Stripe) strictly for billing purposes.</li>
                <li><strong>Legal Authorities:</strong> When required by a valid court order or government directive under Indian law.</li>
              </ul>

              <h3>6. Your Rights</h3>
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
