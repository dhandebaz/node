"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RiskPage() {
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
        title={t("legal.risk.title")} 
        description={t("legal.risk.desc")}
        tag="Legal"
        align="left"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-saffron)_0%,_transparent_20%)] opacity-20"></div>
      </PageHeader>
      
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="glass-card p-8 md:p-12 rounded-2xl prose prose-invert prose-lg max-w-none">
             <p className="text-white/80">
               nodebase provides critical digital infrastructure. While we strive for 99.99% uptime, all technology systems carry inherent risks.
             </p>
             <h3 className="text-xl font-bold mt-8 mb-4 text-white">1. Service Availability</h3>
             <p className="text-white/80">
               We do not guarantee uninterrupted access to our services. Scheduled maintenance and unforeseen outages may occur.
             </p>
          </div>
        </div>
      </section>
    </div>
  );
}
