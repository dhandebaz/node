"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function ContactPage() {
  const { t } = useLanguage();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone relative overflow-hidden font-sans selection:bg-brand-bone/20">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <NetworkBackground />
      </div>

      <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-8 text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60">
              Contact
            </div>
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-6 text-brand-bone leading-[0.9]">{t("contact.title")}</h1>
            <p className="text-xl text-brand-bone/80 leading-relaxed font-light">
              {t("contact.desc")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            
            {/* Sales & Partnerships */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-10 rounded-3xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors group"
            >
              <div className="w-12 h-12 bg-brand-bone/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-brand-bone" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 text-brand-bone">{t("contact.sales")}</h2>
              <p className="text-brand-bone/70 mb-8">For enterprise inquiries and custom solutions.</p>
              <a href="mailto:sales@nodebase.in" className="text-lg font-medium text-brand-bone border-b border-brand-bone/20 hover:border-brand-bone transition-colors pb-1">
                sales@nodebase.in
              </a>
            </motion.div>

            {/* Support */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-10 rounded-3xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors group"
            >
              <div className="w-12 h-12 bg-brand-bone/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-brand-bone" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 text-brand-bone">{t("contact.support")}</h2>
              <p className="text-brand-bone/70 mb-8">Technical assistance for kaisa AI and nodebase Space.</p>
              <a href="mailto:support@nodebase.in" className="text-lg font-medium text-brand-bone border-b border-brand-bone/20 hover:border-brand-bone transition-colors pb-1">
                support@nodebase.in
              </a>
            </motion.div>

          </div>

          {/* Locations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-24 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-12 text-center text-brand-bone">{t("contact.locations")}</h2>
            <div className="flex justify-center">
              <div className="flex gap-6 items-start p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors w-full max-w-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-bone/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-brand-bone" />
                </div>
                <div>
                  <h3 className="font-bold text-xl uppercase tracking-tight mb-3 text-brand-bone">{t("contact.hq_title")}</h3>
                  <p className="text-brand-bone/70 leading-relaxed whitespace-pre-line text-lg">
                    {t("contact.hq_desc")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
