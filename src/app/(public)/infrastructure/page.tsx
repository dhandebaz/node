"use client";

import { motion } from "framer-motion";
import { COMPANY_CONFIG } from "@/lib/config/company";
import { 
  Shield, 
  Zap, 
  Globe, 
  Server as ServerIcon, 
  ArrowRight,
  HardDrive
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

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
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <NetworkBackground />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden z-10 border-b border-brand-bone/20">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-bone/10 text-brand-bone text-sm font-bold mb-8 border border-brand-bone/20 uppercase tracking-wider backdrop-blur-sm">
              <HardDrive className="w-4 h-4" />
              <span>Physical Backbone</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-display-huge font-bold uppercase tracking-tighter text-brand-bone mb-8 leading-[0.85]"
            >
              {t("infra.hero.title")}
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-brand-bone/70 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              {t("infra.hero.desc")}
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="px-8 py-4 bg-brand-bone text-brand-deep-red rounded-full font-bold uppercase tracking-wider hover:bg-white transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
                {t("infra.cta")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Hardware Specs */}
      <section className="py-24 relative z-10 border-b border-brand-bone/20 bg-brand-deep-red/90 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto"
          >
            
            {/* H100 Clusters */}
            <motion.div variants={fadeInUp} className="bg-brand-bone/5 p-8 rounded-2xl border border-brand-bone/10 hover:bg-brand-bone/10 transition-all group backdrop-blur-sm">
              <div className="w-12 h-12 bg-brand-bone/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-brand-bone/20">
                <Zap className="w-6 h-6 text-brand-bone" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-brand-bone uppercase tracking-wide">{t("infra.features.h100.title")}</h3>
              <p className="text-brand-bone/70 leading-relaxed">
                {t("infra.features.h100.desc")}
              </p>
            </motion.div>

            {/* Sovereign Data */}
            <motion.div variants={fadeInUp} className="bg-brand-bone/5 p-8 rounded-2xl border border-brand-bone/10 hover:bg-brand-bone/10 transition-all group backdrop-blur-sm">
              <div className="w-12 h-12 bg-brand-bone/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-brand-bone/20">
                <Shield className="w-6 h-6 text-brand-bone" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-brand-bone uppercase tracking-wide">{t("infra.features.sovereign.title")}</h3>
              <p className="text-brand-bone/70 leading-relaxed">
                {t("infra.features.sovereign.desc")}
              </p>
            </motion.div>

            {/* Colocation */}
            <motion.div variants={fadeInUp} className="bg-brand-bone/5 p-8 rounded-2xl border border-brand-bone/10 hover:bg-brand-bone/10 transition-all group backdrop-blur-sm">
              <div className="w-12 h-12 bg-brand-bone/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-brand-bone/20">
                <ServerIcon className="w-6 h-6 text-brand-bone" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-brand-bone uppercase tracking-wide">{t("infra.features.colo.title")}</h3>
              <p className="text-brand-bone/70 leading-relaxed">
                {t("infra.features.colo.desc")}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Map Concept / Presence */}
      <section className="py-24 relative z-10 border-b border-brand-bone/20">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 text-brand-bone font-bold mb-8 uppercase tracking-widest opacity-60">
              <Globe className="w-5 h-5" />
              <span>Strategic Location</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-display-large font-bold mb-12 uppercase tracking-tighter">Centralized Power in Delhi</motion.h2>
            
            <motion.div variants={fadeInUp} className="flex justify-center">
              <div className="p-8 bg-brand-bone/5 border border-brand-bone/10 rounded-2xl hover:bg-brand-bone/10 transition-colors max-w-md w-full backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                      <h3 className="font-bold text-2xl uppercase tracking-tight">Okhla, Delhi</h3>
                   </div>
                   <span className="px-3 py-1 rounded-full bg-brand-bone/10 text-brand-bone text-xs font-bold border border-brand-bone/20 uppercase tracking-wider">
                     HQ & Datacenter
                   </span>
                </div>
                
                <div className="grid grid-cols-2 gap-6 text-left border-t border-brand-bone/10 pt-6">
                  <div>
                     <p className="text-sm text-brand-bone/50 mb-1 uppercase tracking-wider font-bold">Total Capacity</p>
                     <p className="text-2xl font-bold text-brand-bone">{COMPANY_CONFIG.datacenters[0].capacity.total} Nodes</p>
                  </div>
                  <div>
                     <p className="text-sm text-brand-bone/50 mb-1 uppercase tracking-wider font-bold">Active Nodes</p>
                     <p className="text-2xl font-bold text-brand-bone">{COMPANY_CONFIG.datacenters[0].capacity.active} Online</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Security Badge */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto bg-brand-bone/5 border border-brand-bone/10 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 backdrop-blur-sm"
          >
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-bone/10 text-brand-bone text-xs font-bold border border-brand-bone/20 mb-6 uppercase tracking-wider">
                DPDP Act 2023 Compliant
              </div>
              <h2 className="text-3xl font-bold mb-6 text-brand-bone uppercase tracking-tight">Sovereignty is not a feature.<br/>It's our foundation.</h2>
              <p className="text-brand-bone/80 mb-8 text-lg">
                We guarantee that your data, metadata, and derived insights never leave Indian soil. Physical and logical separation ensures complete control.
              </p>
              <Link href="/login" className="px-8 py-4 bg-brand-bone text-brand-deep-red rounded-full font-bold uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2 shadow-lg hover:shadow-xl w-fit">
                {t("infra.cta")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-shrink-0">
               <Shield className="w-48 h-48 text-brand-bone/10" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}