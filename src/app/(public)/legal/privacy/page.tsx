"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl opacity-20"></div>
         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>

      <PageHeader 
        title={t("legal.privacy.title")} 
        description={t("legal.privacy.desc")}
        tag="Legal"
        align="left"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-blue)_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>
      
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="p-8 md:p-12 glass-card rounded-2xl prose prose-invert prose-lg max-w-none text-white/80">
             <p className="lead text-xl text-white">
               At nodebase (a Chishti Ventures Private Limited company), we are committed to protecting the privacy and security of our users' data. 
               This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">1. Data Sovereignty & Residency</h3>
             <p>
               We process and store all sensitive user data exclusively within the territory of India. We are fully committed to compliance with the 
               <strong> Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>. Your data never leaves Indian soil without your explicit consent or a legal mandate from a competent Indian authority.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">2. Information We Collect</h3>
             <ul className="list-disc pl-6 space-y-2">
               <li><strong>Personal Information:</strong> Name, email address, phone number, and billing information when you register for an account.</li>
               <li><strong>Usage Data:</strong> Server logs, IP addresses, device information, and interaction data to improve system performance and security.</li>
               <li><strong>Content Data:</strong> Files, databases, and application code you upload to our infrastructure. We do not access this content except for automated security scanning (malware detection) or backup purposes.</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">3. How We Use Your Information</h3>
             <p>We use the collected data for the following purposes:</p>
             <ul className="list-disc pl-6 space-y-2">
               <li>To provide, operate, and maintain our services (kaisa AI, Nodebase Space, Infrastructure).</li>
               <li>To process transactions and manage your account credits.</li>
               <li>To detect and prevent fraudulent or malicious activity.</li>
               <li>To comply with legal obligations under Indian law.</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">4. Data Security</h3>
             <p>
               We implement enterprise-grade security measures, including:
             </p>
             <ul className="list-disc pl-6 space-y-2">
               <li><strong>Encryption:</strong> Data is encrypted at rest (AES-256) and in transit (TLS 1.3).</li>
               <li><strong>Access Control:</strong> Strict role-based access control (RBAC) and Multi-Factor Authentication (MFA) for internal administrative access.</li>
               <li><strong>Physical Security:</strong> Our data centers in Mumbai and Bangalore feature biometric access controls and 24/7 surveillance.</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">5. Third-Party Sharing</h3>
             <p>
               We do not sell your personal data. We may share data with:
             </p>
             <ul className="list-disc pl-6 space-y-2">
               <li><strong>Service Providers:</strong> Payment processors (e.g., Razorpay, Stripe) strictly for billing purposes.</li>
               <li><strong>Legal Authorities:</strong> When required by a valid court order or government directive under Indian law.</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">6. Your Rights</h3>
             <p>
               Under the DPDP Act, you have the right to:
             </p>
             <ul className="list-disc pl-6 space-y-2">
               <li>Access the personal data we hold about you.</li>
               <li>Request correction of inaccurate or incomplete data.</li>
               <li>Request erasure of your data (Right to be Forgotten), subject to data retention laws.</li>
               <li>Withdraw consent for data processing at any time.</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">7. Contact Us</h3>
             <p>
               If you have questions about this Privacy Policy, please contact our Grievance Officer:
             </p>
             <div className="bg-white/5 p-6 rounded-xl border border-white/10 mt-4">
               <p className="font-bold text-white">Grievance Officer</p>
               <p>Chishti Ventures Private Limited</p>
               <p>Okhla Industrial Estate, Phase III</p>
               <p>New Delhi, India 110020</p>
               <p className="mt-2 text-brand-saffron">Email: privacy@nodebase.space</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
