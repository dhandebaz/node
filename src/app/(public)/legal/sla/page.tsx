"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SlaPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl opacity-20"></div>
         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-saffron/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>

      <PageHeader 
        title={t("legal.sla.title")} 
        description={t("legal.sla.desc")}
        tag="Legal"
        align="left"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-green)_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>
      
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="glass-card p-8 md:p-12 rounded-2xl prose prose-invert prose-lg max-w-none text-white/80">
             <p className="lead text-xl text-white">
               This Service Level Agreement (SLA) defines the uptime guarantees for Nodebase services and the compensation we provide if we fail to meet them.
             </p>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">1. Uptime Guarantee</h3>
             <p>
               We guarantee that our network and power infrastructure will be available <strong>99.9%</strong> of the time during any monthly billing cycle.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
               <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                 <h4 className="font-bold text-white mb-2">Service</h4>
                 <p className="text-sm">Nodebase Space (Shared & Dedicated)</p>
               </div>
               <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                 <h4 className="font-bold text-brand-green mb-2">Guarantee</h4>
                 <p className="text-sm">99.9% Uptime</p>
               </div>
             </div>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">2. Service Credits</h3>
             <p>
               If we fail to meet the Uptime Guarantee, you are eligible for Service Credits calculated as a percentage of your monthly bill for the affected service:
             </p>
             <table className="w-full text-left border-collapse my-6">
               <thead>
                 <tr className="border-b border-white/20">
                   <th className="py-2 text-white">Uptime Percentage</th>
                   <th className="py-2 text-white">Credit Percentage</th>
                 </tr>
               </thead>
               <tbody className="text-white/70">
                 <tr className="border-b border-white/10">
                   <td className="py-2">99.0% - 99.89%</td>
                   <td className="py-2">10% Credit</td>
                 </tr>
                 <tr className="border-b border-white/10">
                   <td className="py-2">95.0% - 98.99%</td>
                   <td className="py-2">25% Credit</td>
                 </tr>
                 <tr className="border-b border-white/10">
                   <td className="py-2">Below 95.0%</td>
                   <td className="py-2">100% Credit</td>
                 </tr>
               </tbody>
             </table>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">3. Exclusions</h3>
             <p>The following downtime events are <strong>not</strong> covered by this SLA:</p>
             <ul className="list-disc pl-6 space-y-2">
               <li>Scheduled maintenance (notified at least 24 hours in advance).</li>
               <li>Force majeure events (acts of God, war, terrorism, natural disasters).</li>
               <li>Downtime caused by your own software, configuration, or misuse of the service.</li>
               <li>Outages caused by third-party upstream providers (e.g., fiber cuts outside our datacenter).</li>
             </ul>

             <h3 className="text-2xl font-bold mt-12 mb-6 text-white">4. Claiming Credits</h3>
             <p>
               To claim a credit, you must open a support ticket within 30 days of the incident. You must provide details of the outage (logs, timestamps). 
               Credits are applied to future invoices and cannot be exchanged for cash.
             </p>
          </div>
        </div>
      </section>
    </div>
  );
}
