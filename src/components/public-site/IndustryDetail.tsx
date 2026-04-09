"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Bot,
  MessageSquare,
  Calendar,
  CreditCard,
  ShieldCheck,
  Phone,
  Star,
  Users,
  Store,
  Building2,
  Stethoscope,
  ShoppingBag,
  Home,
} from "lucide-react";
import { industries, type Industry } from "@/lib/data/industries";

interface IndustryDetailProps {
  industrySlug: string;
}

const iconMap: Record<string, React.ElementType> = {
  hospitality: Building2,
  healthcare: Stethoscope,
  retail: Store,
  "social-commerce": ShoppingBag,
  "real-estate": Home,
};

export function IndustryDetail({ industrySlug }: IndustryDetailProps) {
  const industry = industries.find((i) => i.slug === industrySlug);

  if (!industry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Industry not found</h1>
          <Link href="/industries" className="text-blue-400 hover:underline">
            Back to industries
          </Link>
        </div>
      </div>
    );
  }

  const Icon = industry.icon;
  const iconComponent = iconMap[industry.slug] || Bot;

  return (
    <div className="relative pb-32 pt-24 sm:pt-32 overflow-hidden">
      <div className="public-container relative z-10 space-y-16">
        {/* HERO */}
        <section className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -z-10"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-blue-500/30 text-sm font-bold text-blue-400 mb-6"
          >
            <Icon className="w-4 h-4" />
            {industry.name}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl text-white tracking-tight mb-6"
          >
            AI for{" "}
            <span className="text-gradient-primary">{industry.name}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8"
          >
            {industry.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all"
            >
              Try Free for {industry.name} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/industries"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-panel text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              View Other Industries
            </Link>
          </motion.div>
        </section>

        {/* TARGET CUSTOMER */}
        <section className="glass-panel p-8 sm:p-12 rounded-[2.5rem]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Who It's For</h2>
          </div>
          <p className="text-lg text-zinc-300 mb-6">{industry.targetCustomer}</p>
          <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Common Pain Points</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {industry.painPoints.map((pain) => (
                <div
                  key={pain}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-300"
                >
                  {pain}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CASE STUDY */}
        {industry.caseStudy && (
          <section className="glass-panel-glow p-8 sm:p-12 rounded-[2.5rem] border border-emerald-500/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Star className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Real Results</h2>
                <p className="text-sm text-zinc-500">From a real NodeBase customer</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-3xl font-black text-white mb-2">{industry.caseStudy.business}</p>
                <p className="text-zinc-400">{industry.caseStudy.type}</p>
              </div>
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400 font-bold mb-2">KEY RESULT</p>
                <p className="text-xl font-black text-white mb-1">{industry.caseStudy.result}</p>
                <p className="text-sm text-zinc-400">{industry.caseStudy.metric}</p>
              </div>
            </div>
          </section>
        )}

        {/* AI AGENT */}
        <section className="glass-panel p-8 sm:p-12 rounded-[2.5rem]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
              <Bot className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">{industry.aiAgent.name}</h2>
              <p className="text-zinc-400">{industry.aiAgent.description}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-4">What It Can Do</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {industry.aiAgent.capabilities.map((cap) => (
              <div
                key={cap}
                className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-300">{cap}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">
              Features Built for {industry.name}
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Every feature is designed specifically for {industry.name.toLowerCase()} operations
            </p>
          </div>

          <div className="space-y-6">
            {industry.features.map((feature, idx) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="glass-panel p-8 rounded-[2.5rem]"
                >
                  <div className="flex flex-col md:flex-row gap-6 md:items-start">
                    <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <FeatureIcon className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-black text-white mb-3">{feature.title}</h3>
                      <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center glass-panel-glow p-12 sm:p-20 rounded-[2.5rem] border border-emerald-500/30">
          <h2 className="text-4xl font-black text-white mb-4">
            Ready for {industry.name} AI?
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Deploy {industry.aiAgent.name} for your {industry.name.toLowerCase()} business. 
            Get started in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all text-lg"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-panel text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
