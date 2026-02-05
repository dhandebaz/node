"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight, 
  Brain, 
  Cloud, 
  HardDrive, 
  ShieldCheck, 
  Activity, 
  MapPin, 
  Server, 
  Database, 
  TrendingUp, 
  Cpu, 
  Sparkles,
  PlayCircle
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function Home() {
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
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-brand-saffron/30 overflow-x-hidden">
      
      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 overflow-hidden min-h-[90vh] flex flex-col justify-center">
        <NetworkBackground />
        
        {/* Gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-brand-saffron)_0%,_transparent_50%)] opacity-5 pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                <span className="text-xs font-medium text-white/70 tracking-wide uppercase">{t("reality.status")}</span>
              </div>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.1]"
            >
              {t("hero.headline")}
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            >
              {t("hero.description")}
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link 
                href="/node" 
                className="group px-8 py-4 bg-brand-saffron text-white rounded-full font-medium hover:bg-brand-saffron/90 transition-all shadow-lg shadow-brand-saffron/20 flex items-center gap-2"
              >
                {t("hero.cta.primary")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/node/how-it-works" 
                className="group px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-medium hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <PlayCircle className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                {t("hero.cta.secondary")}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. REALITY STRIP */}
      <section className="border-y border-white/5 bg-white/[0.02] backdrop-blur-md relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            {[
              { label: "Location", value: t("reality.location"), icon: MapPin },
              { label: "Active Nodes", value: "6", icon: Server },
              { label: "Total Capacity", value: "160 Nodes", icon: Database },
              { label: "System Status", value: t("reality.status"), icon: Activity, color: "text-brand-green" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-center py-6 md:py-8 group hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2 mb-1 opacity-50 group-hover:opacity-100 transition-opacity">
                  <item.icon className={`w-4 h-4 ${item.color || "text-white"}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
                </div>
                <span className="text-lg md:text-xl font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VISUAL STORY (DIFFERENCE) */}
      <section className="py-24 md:py-32 bg-black relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: t("story.own.title"), 
                desc: t("story.own.desc"), 
                icon: HardDrive,
                gradient: "from-white/20 to-transparent"
              },
              { 
                title: t("story.india.title"), 
                desc: t("story.india.desc"), 
                icon: ShieldCheck,
                gradient: "from-brand-saffron/20 to-transparent"
              },
              { 
                title: t("story.ai.title"), 
                desc: t("story.ai.desc"), 
                icon: Brain,
                gradient: "from-purple-500/20 to-transparent"
              },
              { 
                title: t("story.scale.title"), 
                desc: t("story.scale.desc"), 
                icon: TrendingUp,
                gradient: "from-emerald-500/20 to-transparent"
              },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group relative p-8 rounded-3xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRODUCTS SYSTEM */}
      <section className="py-24 md:py-32 bg-black relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/5 rounded-full blur-[100px] pointer-events-none opacity-50"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t("products.system.title")}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Kaisa */}
            <Link href="/products/kaisa" className="group">
              <div className="h-full p-8 rounded-3xl border border-white/10 bg-black hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="w-32 h-32 text-brand-saffron" />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-10 h-10 rounded-full bg-brand-saffron/10 flex items-center justify-center mb-6">
                    <Sparkles className="w-5 h-5 text-brand-saffron" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">kaisa AI</h3>
                  <p className="text-white/60 mb-8 flex-grow">{t("products.kaisa.desc")}</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-brand-saffron">
                    {t("products.learn_more")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Space */}
            <Link href="/products/space" className="group">
              <div className="h-full p-8 rounded-3xl border border-white/10 bg-black hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Cloud className="w-32 h-32 text-brand-red" />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center mb-6">
                    <Cloud className="w-5 h-5 text-brand-red" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">nodebase Space</h3>
                  <p className="text-white/60 mb-8 flex-grow">{t("products.space.desc")}</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-brand-red">
                    {t("products.learn_more")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Node */}
            <Link href="/node/infrastructure" className="group">
              <div className="h-full p-8 rounded-3xl border border-white/10 bg-black hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Cpu className="w-32 h-32 text-brand-green" />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center mb-6">
                    <Cpu className="w-5 h-5 text-brand-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Node</h3>
                  <p className="text-white/60 mb-8 flex-grow">{t("products.node.desc")}</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-brand-green">
                    {t("products.learn_more")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. CONNECTION FLOW */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2 z-0"></div>
              
              {[
                { label: t("flow.infra"), icon: Server },
                { label: t("flow.products"), icon:  Brain }, // Using Brain as abstract for products
                { label: t("flow.usage"), icon: Activity },
                { label: t("flow.revenue"), icon: TrendingUp },
                { label: t("flow.nodes"), icon: Cpu },
              ].map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center gap-4 bg-black p-4 rounded-xl border border-white/10 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/70">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white/60 uppercase tracking-wide">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-32 bg-black relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--color-brand-saffron)_0%,_transparent_20%)] opacity-10 pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">{t("cta.final.title")}</h2>
          <Link 
            href="/node/how-it-works" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all"
          >
            {t("cta.final.button")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
