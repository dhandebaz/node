"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">{t("contact.title")}</h1>
            <p className="text-xl text-white/80 leading-relaxed">
              {t("contact.desc")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            
            {/* Sales & Partnerships */}
            <div className="glass-card p-10 rounded-3xl hover:bg-white/10 transition-colors group">
              <div className="w-12 h-12 glass-dark rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-brand-blue" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">{t("contact.sales")}</h2>
              <p className="text-white/70 mb-8">For enterprise inquiries and custom solutions.</p>
              <a href="mailto:sales@nodebase.in" className="text-lg font-medium text-brand-blue hover:text-brand-blue/80 hover:underline">
                sales@nodebase.in
              </a>
            </div>

            {/* Support */}
            <div className="glass-card p-10 rounded-3xl hover:bg-white/10 transition-colors group">
              <div className="w-12 h-12 glass-dark rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-brand-green" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">{t("contact.support")}</h2>
              <p className="text-white/70 mb-8">Technical assistance for kaisa AI and nodebase Space.</p>
              <a href="mailto:support@nodebase.in" className="text-lg font-medium text-brand-green hover:text-brand-green/80 hover:underline">
                support@nodebase.in
              </a>
            </div>

          </div>

          {/* Locations */}
          <div className="mt-24 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-12 text-center text-white">{t("contact.locations")}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-6 items-start p-6 glass-card rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 glass-dark rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-white">{t("contact.mumbai")}</h3>
                  <p className="text-white/70 leading-relaxed">
                    The Capital, Bandra Kurla Complex<br />
                    Mumbai, Maharashtra 400051
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start p-6 glass-card rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 glass-dark rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-white">{t("contact.bangalore")}</h3>
                  <p className="text-white/70 leading-relaxed">
                    Prestige Tech Park, Marathahalli<br />
                    Bangalore, Karnataka 560103
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
