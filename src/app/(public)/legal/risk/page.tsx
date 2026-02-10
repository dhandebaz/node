"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { motion } from "framer-motion";

export default function RiskPage() {
  const { t } = useLanguage();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-brand-deep-red min-h-screen text-brand-bone relative overflow-hidden font-sans selection:bg-brand-bone/20">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <NetworkBackground />
      </div>

      <PageHeader 
        title={t("legal.risk.title")} 
        description={t("legal.risk.desc")}
        tag="Legal"
        align="left"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-bone)_0%,_transparent_20%)] opacity-5"></div>
      </PageHeader>
      
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm p-8 md:p-12 rounded-2xl prose prose-invert prose-lg max-w-none prose-headings:text-brand-bone prose-p:text-brand-bone/80 prose-strong:text-brand-bone"
          >
             <p>
               nodebase provides critical digital infrastructure. While we strive for 99.99% uptime, all technology systems carry inherent risks.
             </p>
             <h3 className="text-xl font-bold mt-8 mb-4 uppercase tracking-tight">1. Service Availability</h3>
             <p>
               We do not guarantee uninterrupted access to our services. Scheduled maintenance and unforeseen outages may occur.
             </p>

             <h3 className="text-xl font-bold mt-8 mb-4 uppercase tracking-tight">2. AI Employee Behavior</h3>
             <p>
               Nodebase AI Employees are powered by large language models. While they are designed to be accurate and safe:
             </p>
             <ul className="list-disc pl-6 space-y-2 mt-4">
               <li><strong>Accuracy:</strong> AI may occasionally provide incorrect information or "hallucinate" facts. You are responsible for verifying critical communications.</li>
               <li><strong>Decision Making:</strong> Automated decisions (e.g., accepting bookings, sending refunds) are executed based on your configured rules. You are liable for actions taken by your AI Employee within these rules.</li>
               <li><strong>Supervision:</strong> We recommend periodic review of AI conversations, especially during the initial setup phase.</li>
             </ul>

             <h3 className="text-xl font-bold mt-8 mb-4 uppercase tracking-tight">3. Financial Risk</h3>
             <p>
               Nodebase is not a bank. Wallet balances are pre-paid credits for service usage and are non-refundable except as required by law.
             </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
