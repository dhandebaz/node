"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RefundPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-saffron/10 rounded-full blur-3xl opacity-20"></div>
         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>

      <PageHeader 
        title={t("legal.refund.title")} 
        description={t("legal.refund.desc")}
        tag="Legal"
        align="left"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-saffron)_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>
      
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="glass-card p-8 md:p-12 rounded-2xl prose prose-invert prose-lg max-w-none text-white/80">
             <p className="lead text-xl text-white">
               At nodebase, we strive to ensure customer satisfaction. However, due to the nature of digital infrastructure and compute resources, our refund policies are strictly defined below.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">1. General Refund Policy</h3>
             <ul className="list-disc pl-6 space-y-2">
               <li><strong>Subscriptions:</strong> Monthly and annual subscriptions are non-refundable once the service period has commenced. You may cancel at any time to prevent future billing.</li>
               <li><strong>Prepaid Credits:</strong> Unused prepaid credits for kaisa AI or Nodebase Space are non-refundable and non-transferable, except where required by law.</li>
               <li><strong>Dedicated Servers:</strong> Setup fees for dedicated hardware are non-refundable.</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">2. 30-Day Money Back Guarantee (Shared Hosting)</h3>
             <p>
               For <strong>Nodebase Space Shared Hosting</strong> plans only, we offer a 30-day money-back guarantee. If you are not satisfied with the service, you may request a full refund within the first 30 days of your initial sign-up.
             </p>
             <p>This guarantee does <strong>not</strong> apply to:</p>
             <ul className="list-disc pl-6 space-y-2">
               <li>Domain name registrations.</li>
               <li>Dedicated servers or VPS instances.</li>
               <li>Add-on services (e.g., Dedicated IPs, Premium SSLs).</li>
               <li>Accounts terminated due to violation of our Terms of Service.</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">3. Service Failure Refunds</h3>
             <p>
               If you experience downtime exceeding our Service Level Agreement (SLA) limits, you are eligible for service credits as defined in our <a href="/legal/sla" className="text-brand-saffron hover:underline">SLA</a>. 
               In cases of catastrophic service failure where data is permanently lost due to our negligence, we may, at our sole discretion, issue a pro-rated refund for the affected billing period.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">4. Cancellation Process</h3>
             <p>
               To cancel a service, please log in to your dashboard and navigate to the billing section. Cancellation requests must be submitted at least 24 hours before the renewal date to avoid automatic charges.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">5. Contact for Refunds</h3>
             <p>
               To request a refund under the 30-day guarantee or for billing disputes, please contact our billing team:
             </p>
             <div className="bg-white/5 p-6 rounded-xl border border-white/10 mt-4">
               <p className="text-brand-saffron font-bold">billing@nodebase.space</p>
               <p className="text-sm mt-2 text-white/60">Please include your Account ID and Transaction Reference Number.</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
