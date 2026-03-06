"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SlaPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-brand-deep-red min-h-screen text-brand-bone relative overflow-hidden font-sans selection:bg-brand-bone/20 bg-grid-pattern">

      <div className="relative z-10 pt-32 pb-24 px-6 container mx-auto max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <PageHeader 
            title={t("legal.sla.title")}
            tag="Legal"
            description="Our commitment to uptime and reliability."
            className="mb-12"
          />

          <div className="p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm">
            <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone hover:prose-a:text-white">
              <p className="lead text-xl text-brand-bone">
                This Service Level Agreement (SLA) defines the uptime guarantees for Nodebase services and the compensation we provide if we fail to meet them.
              </p>

              <h3>1. Uptime Guarantee</h3>
              <p>
                We guarantee that our AI platform services will be available <strong>99.9%</strong> of the time during any monthly billing cycle.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
                <div className="bg-brand-bone/10 p-4 rounded-lg border border-brand-bone/10">
                  <h4 className="font-bold text-brand-bone mb-2">Service</h4>
                  <p className="text-sm text-brand-bone/80">Kaisa AI Platform</p>
                </div>
                <div className="bg-brand-bone/10 p-4 rounded-lg border border-brand-bone/10">
                  <h4 className="font-bold text-brand-bone mb-2">Guarantee</h4>
                  <p className="text-sm text-brand-bone/80">99.9% Uptime</p>
                </div>
              </div>

              <h3>2. Service Credits</h3>
              <p>
                If we fail to meet the Uptime Guarantee, you are eligible for Service Credits calculated as a percentage of your monthly bill for the affected service:
              </p>
              <table className="w-full text-left border-collapse my-6">
                <thead>
                  <tr className="border-b border-brand-bone/20">
                    <th className="py-2 text-brand-bone">Uptime Percentage</th>
                    <th className="py-2 text-brand-bone">Credit Percentage</th>
                  </tr>
                </thead>
                <tbody className="text-brand-bone/70">
                  <tr className="border-b border-brand-bone/10">
                    <td className="py-2">99.0% - 99.89%</td>
                    <td className="py-2">10% Credit</td>
                  </tr>
                  <tr className="border-b border-brand-bone/10">
                    <td className="py-2">95.0% - 98.99%</td>
                    <td className="py-2">25% Credit</td>
                  </tr>
                  <tr className="border-b border-brand-bone/10">
                    <td className="py-2">Below 95.0%</td>
                    <td className="py-2">100% Credit</td>
                  </tr>
                </tbody>
              </table>

              <h3>3. Exclusions</h3>
              <p>The following downtime events are <strong>not</strong> covered by this SLA:</p>
              <ul>
                <li>Scheduled maintenance (notified at least 24 hours in advance).</li>
                <li>Force majeure events (acts of God, war, terrorism, natural disasters).</li>
                <li>Downtime caused by your own software, configuration, or misuse of the service.</li>
                <li>Outages caused by third-party upstream providers (e.g., fiber cuts outside our datacenter).</li>
              </ul>

              <h3>4. Claiming Credits</h3>
              <p>
                To claim a credit, you must open a support ticket within 30 days of the incident. You must provide details of the outage (logs, timestamps). 
                Credits are applied to future invoices and cannot be exchanged for cash.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
