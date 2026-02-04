"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  Zap, 
  Globe, 
  Server as ServerIcon, 
  Lock, 
  ArrowRight,
  HardDrive
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function InfrastructurePage() {
  const { t } = useLanguage();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-green)_0%,_transparent_15%)] opacity-20"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-brand-green text-sm font-medium mb-8 border border-brand-green/20">
              <HardDrive className="w-4 h-4" />
              <span>Physical Backbone</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight"
            >
              {t("infra.hero.title")}
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              {t("infra.hero.desc")}
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-4 bg-brand-green text-white rounded-full font-medium hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20 flex items-center gap-2">
                {t("infra.cta")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Hardware Specs */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            
            {/* H100 Clusters */}
            <div className="glass-card p-8 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 glass-dark rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t("infra.features.h100.title")}</h3>
              <p className="text-white/70 leading-relaxed">
                {t("infra.features.h100.desc")}
              </p>
            </div>

            {/* Sovereign Data */}
            <div className="glass-card p-8 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 glass-dark rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t("infra.features.sovereign.title")}</h3>
              <p className="text-white/70 leading-relaxed">
                {t("infra.features.sovereign.desc")}
              </p>
            </div>

            {/* Colocation */}
            <div className="glass-card p-8 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 glass-dark rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ServerIcon className="w-6 h-6 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t("infra.features.colo.title")}</h3>
              <p className="text-white/70 leading-relaxed">
                {t("infra.features.colo.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Concept / Presence */}
      <section className="py-24 glass-dark text-white overflow-hidden relative border-y border-white/10">
        <div className="absolute inset-0 bg-brand-green/10 opacity-20"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 text-brand-green font-medium mb-8">
              <Globe className="w-5 h-5" />
              <span>Pan-India Network</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-12">Low Latency Across the Subcontinent</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
              <div className="p-6 glass-card rounded-xl hover:bg-white/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-brand-green mb-4 animate-pulse"></div>
                <h3 className="font-bold text-lg">Mumbai</h3>
                <p className="text-sm text-white/70">Primary Region</p>
              </div>
              <div className="p-6 glass-card rounded-xl hover:bg-white/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-brand-green mb-4 animate-pulse"></div>
                <h3 className="font-bold text-lg">Delhi NCR</h3>
                <p className="text-sm text-white/70">Primary Region</p>
              </div>
              <div className="p-6 glass-card rounded-xl hover:bg-white/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-brand-green mb-4 animate-pulse"></div>
                <h3 className="font-bold text-lg">Bangalore</h3>
                <p className="text-sm text-white/70">Edge Zone</p>
              </div>
              <div className="p-6 glass-card rounded-xl hover:bg-white/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-brand-green mb-4 animate-pulse"></div>
                <h3 className="font-bold text-lg">Hyderabad</h3>
                <p className="text-sm text-white/70">Edge Zone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Badge */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto glass-card rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-green text-xs font-bold border border-brand-green/20 mb-6 uppercase tracking-wider">
                DPDP Act 2023 Compliant
              </div>
              <h2 className="text-3xl font-bold mb-6 text-white">Sovereignty is not a feature. It's our foundation.</h2>
              <p className="text-white/80 mb-8">
                We guarantee that your data, metadata, and derived insights never leave Indian soil. Physical and logical separation ensures complete control.
              </p>
              <button className="px-8 py-4 bg-brand-green text-white rounded-full font-medium hover:bg-brand-green/90 transition-all flex items-center gap-2 shadow-lg shadow-brand-green/20">
                {t("infra.cta")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-shrink-0">
               <Shield className="w-48 h-48 text-brand-green/20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}