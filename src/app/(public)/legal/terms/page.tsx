"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl opacity-20"></div>
         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>

      <PageHeader 
        title={t("legal.terms.title")} 
        description={t("legal.terms.desc")}
        tag="Legal"
        align="left"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-green)_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>
      
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="glass-card p-8 md:p-12 rounded-2xl prose prose-invert prose-lg max-w-none text-white/80">
             <p className="lead text-xl text-white">
               Welcome to nodebase. By accessing or using our website, services, or products, you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">1. Acceptance of Terms</h3>
             <p>
               These Terms constitute a legally binding agreement between you ("User") and Chishti Ventures Private Limited ("nodebase", "we", "us"). 
               If you do not agree to these Terms, you must not access or use our Services.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">2. Services Description</h3>
             <p>
               Nodebase provides digital infrastructure services, including but not limited to:
             </p>
             <ul className="list-disc pl-6 space-y-2">
               <li><strong>kaisa AI:</strong> An AI agent management platform.</li>
               <li><strong>Nodebase Space:</strong> Cloud hosting, storage, and computing resources.</li>
               <li><strong>Infrastructure:</strong> Physical node participation and colocation services.</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">3. User Account & Security</h3>
             <p>
               You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access 
               to your account. Nodebase will not be liable for any loss or damage arising from your failure to protect your account.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">4. Payments, Credits, and Billing</h3>
             <ul className="list-disc pl-6 space-y-2">
               <li><strong>Prepaid Credits:</strong> Some services (like kaisa AI) operate on a prepaid credit system. Credits are non-transferable.</li>
               <li><strong>Subscriptions:</strong> Recurring subscriptions are billed in advance. Failure to pay may result in service suspension.</li>
               <li><strong>Taxes:</strong> All fees are exclusive of applicable taxes (GST), which will be charged additionally.</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">5. Acceptable Use</h3>
             <p>
               You agree not to use our services for any illegal or unauthorized purpose, including but not limited to:
             </p>
             <ul className="list-disc pl-6 space-y-2">
               <li>Hosting malicious content (malware, phishing).</li>
               <li>Violating intellectual property rights.</li>
               <li>Engaging in cryptocurrency mining without explicit authorization.</li>
               <li>Launching DDoS attacks or network scans.</li>
             </ul>
             <p>
               Violation of these rules will result in immediate termination of your account without refund.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">6. Limitation of Liability</h3>
             <p>
               To the maximum extent permitted by law, Nodebase shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
               or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">7. Governing Law</h3>
             <p>
               These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject 
               to the exclusive jurisdiction of the courts located in New Delhi, India.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">8. Changes to Terms</h3>
             <p>
               We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or a prominent notice on our website. 
               Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
             </p>
          </div>
        </div>
      </section>
    </div>
  );
}
