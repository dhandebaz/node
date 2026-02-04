"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AupPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl opacity-20"></div>
         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-saffron/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>

      <PageHeader 
        title={t("legal.aup.title")} 
        description={t("legal.aup.desc")}
        tag="Legal"
        align="left"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-red-500)_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>
      
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="glass-card p-8 md:p-12 rounded-2xl prose prose-invert prose-lg max-w-none text-white/80">
             <p className="lead text-xl text-white">
               This Acceptable Use Policy (AUP) outlines the prohibited uses of the nodebase network, systems, and services. 
               All users must comply with this policy.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">1. Prohibited Content</h3>
             <p>You may not use our services to host, store, or transmit:</p>
             <ul className="list-disc pl-6 space-y-2">
               <li>Child Sexual Abuse Material (CSAM). We have a zero-tolerance policy and will report to authorities immediately.</li>
               <li>Content that promotes terrorism, violence, or hate speech.</li>
               <li>Phishing sites, scam pages, or fraudulent schemes.</li>
               <li>Copyrighted material without the explicit permission of the owner.</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">2. System Abuse</h3>
             <p>You may not:</p>
             <ul className="list-disc pl-6 space-y-2">
               <li>Attempt to disrupt, degrade, or interfere with the integrity of the nodebase network (DDoS).</li>
               <li>Perform unauthorized vulnerability scanning or penetration testing.</li>
               <li>Use shared hosting resources excessively to the detriment of other users ("noisy neighbor" behavior).</li>
               <li>Send unsolicited bulk email (SPAM).</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">3. Resource Usage</h3>
             <ul className="list-disc pl-6 space-y-2">
               <li><strong>Crypto Mining:</strong> Cryptocurrency mining is strictly prohibited on Shared Hosting and VPS plans. It is allowed only on Dedicated Servers with prior approval.</li>
               <li><strong>Proxies/VPNs:</strong> Public proxies and VPN endpoints are prohibited on Shared Hosting.</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">4. Enforcement</h3>
             <p>
               Nodebase reserves the right to investigate any violation of this AUP. We may:
             </p>
             <ul className="list-disc pl-6 space-y-2">
               <li>Remove or block access to prohibited content.</li>
               <li>Suspend or terminate your account without notice.</li>
               <li>Report illegal activities to law enforcement agencies.</li>
             </ul>
             <p className="mt-4">
               If you suspect a violation of this policy, please report it to <span className="text-brand-saffron">abuse@nodebase.space</span>.
             </p>
          </div>
        </div>
      </section>
    </div>
  );
}
