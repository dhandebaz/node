"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  CreditCard,
  Eye,
  Globe,
  Headphones,
  MessageSquare,
  Mic,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Video,
  Wallet,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const featureCategories = [
  {
    title: "Unified Inbox",
    description: "Every channel, one conversation. Never miss a customer again.",
    icon: MessageSquare,
    features: [
      { title: "Omnichannel Centralization", description: "WhatsApp, Instagram, Messenger, Telegram - all in one inbox" },
      { title: "Smart Threading", description: "Auto-group related messages into single conversations" },
      { title: "Real-time Sync", description: "Instant message delivery across all platforms" },
      { title: "Guest Detection", description: "Automatically identify returning customers" },
    ],
  },
  {
    title: "AI Employees",
    description: "Domain-specific AI that understands your business.",
    icon: Bot,
    features: [
      { title: "Business-Specific Training", description: "AI trained on your rules, pricing, and policies" },
      { title: "Autonomous Handling", description: "AI answers questions and takes bookings 24/7" },
      { title: "Context Memory", description: "Remembers conversation history across sessions" },
      { title: "Fallback to Human", description: "Complex queries instantly routed to you" },
    ],
  },
  {
    title: "Voice & Vision",
    description: "Multimodal AI capabilities for advanced use cases.",
    icon: Mic,
    features: [
      { title: "Nodebase Voice", description: "AI-powered phone call handling via Twilio" },
      { title: "Nodebase Eyes", description: "OCR for menus, IDs, and documents" },
      { title: "Visual Verification", description: "Auto-verify documents with AI" },
      { title: "Voice Synthesis", description: "Natural-sounding AI voices in multiple languages" },
    ],
  },
  {
    title: "Trust & Compliance",
    description: "Enterprise-grade security and compliance built in.",
    icon: ShieldCheck,
    features: [
      { title: "Automated KYC", description: "ID verification with OCR and validation" },
      { title: "Consent Management", description: "Dynamic consent forms with audit trails" },
      { title: "Data Encryption", description: "End-to-end encryption for sensitive data" },
      { title: "SOC 2 Compliant", description: "Industry-standard security certifications" },
    ],
  },
  {
    title: "Payments",
    description: "Seamless payment collection without friction.",
    icon: CreditCard,
    features: [
      { title: "Payment Links", description: "Generate and send payment links instantly" },
      { title: "Screenshot Verification", description: "Customer uploads payment proof, AI verifies" },
      { title: "UPI Integration", description: "Native UPI support for Indian payments" },
      { title: "Automated Receipts", description: "Instant confirmation upon payment" },
    ],
  },
  {
    title: "Analytics & Reporting",
    description: "Data-driven insights for better decisions.",
    icon: BarChart3,
    features: [
      { title: "Conversation Analytics", description: "Track response times, resolution rates, AI vs human" },
      { title: "Revenue Metrics", description: "Bookings, revenue, and conversion tracking" },
      { title: "Customer Insights", description: "Unified customer profiles across channels" },
      { title: "Export Reports", description: "Download detailed reports for analysis" },
    ],
  },
];

const comparisonFeatures = [
  { nodebase: true, traditional: false, feature: "24/7 AI availability" },
  { nodebase: true, traditional: false, feature: "Instant response to every query" },
  { nodebase: true, traditional: false, feature: "Multilingual support" },
  { nodebase: true, traditional: false, feature: "Automated booking flow" },
  { nodebase: true, traditional: false, feature: "Unified inbox (all channels)" },
  { nodebase: true, traditional: false, feature: "AI-powered document verification" },
  { nodebase: true, traditional: false, feature: "Smart handoff to humans" },
  { nodebase: false, traditional: true, feature: "Limited hours (9-6)" },
  { nodebase: false, traditional: true, feature: "Manual message checking" },
  { nodebase: false, traditional: true, feature: "Switching between apps" },
  { nodebase: false, traditional: true, feature: "Repetitive responses" },
];

export function FeaturesPage() {
  return (
    <div className="relative pb-32 pt-36 sm:pt-48 lg:pt-56 overflow-hidden">
      <div className="public-container relative z-10 space-y-32">
        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-blue-500/30 text-xs font-semibold tracking-wide text-blue-400 mb-8 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Platform Capabilities</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display max-w-5xl text-6xl leading-[1.1] text-foreground sm:text-7xl lg:text-8xl tracking-tighter"
          >
            Everything you need to <span className="text-gradient-primary">scale operations</span>.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-zinc-400 font-sans"
          >
            From unified inbox to AI voice calls, from automated KYC to payment processing - 
            Nodebase gives you the enterprise workforce your business deserves.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 border border-blue-400/50 shadow-[0_0_30px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] px-8 py-4 text-sm font-bold text-white hover:shadow-[0_0_40px_rgba(37,99,235,0.7)] hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="rounded-full glass-panel px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2"
            >
              View Pricing
            </Link>
          </motion.div>
        </section>

        {/* FEATURE CATEGORIES */}
        <section className="space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-4xl text-white tracking-tighter">
              One platform. Infinite possibilities.
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Everything you need to automate customer conversations and scale your business.
            </p>
          </div>

          <div className="grid gap-8">
            {featureCategories.map((category, index) => {
              const Icon = category.icon;
              const isEven = index % 2 === 0;
              return (
                <motion.section
                  key={category.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={reveal}
                  className={`grid lg:grid-cols-2 gap-8 items-center ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  <div className={`${isEven ? "" : "lg:order-2"} space-y-6`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30">
                        <Icon className="h-6 w-6 text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                    </div>
                    <p className="text-lg text-zinc-400">{category.description}</p>
                    <ul className="space-y-4">
                      {category.features.map((feature) => (
                        <li key={feature.title} className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-white font-medium">{feature.title}</span>
                            <span className="text-zinc-500"> - {feature.description}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${isEven ? "lg:order-2" : ""} glass-panel p-8 rounded-[2rem]`}>
                    <div className="grid grid-cols-2 gap-4">
                      {category.features.map((feature) => (
                        <div key={feature.title} className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="text-sm font-bold text-white">{feature.title}</div>
                          <div className="text-xs text-zinc-500 mt-1">{feature.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.section>
              );
            })}
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section className="glass-panel-glow p-12 sm:p-20 rounded-[3rem]">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-white tracking-tighter">
              Why Nodebase wins
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Compare the difference between traditional operations and Nodebase AI.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Traditional</div>
              <ul className="space-y-4 text-left">
                {comparisonFeatures.filter(f => !f.nodebase).map((item) => (
                  <li key={item.feature} className="flex items-center gap-3 text-zinc-400">
                    <div className="w-2 h-2 rounded-full bg-zinc-600" />
                    {item.feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex py-2 px-4 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
                vs
              </div>
            </div>
            <div className="text-center p-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">Nodebase</div>
              <ul className="space-y-4 text-left">
                {comparisonFeatures.filter(f => f.nodebase).map((item) => (
                  <li key={item.feature} className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="h-5 w-5 text-blue-400" />
                    {item.feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="text-center">
          <h2 className="font-display text-4xl text-white tracking-tighter mb-6">
            Ready to transform your business?
          </h2>
          <p className="text-lg text-zinc-400 mb-8">
            Join thousands of businesses already using Nodebase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 border border-blue-400/50 px-8 py-4 text-sm font-bold text-white hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/company/contact"
              className="rounded-full glass-panel px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-all"
            >
              Talk to Sales
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
