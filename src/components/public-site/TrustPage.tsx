"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Cloud,
  Eye,
  FileCheck,
  Fingerprint,
  Globe,
  Lock,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const trustPillars = [
  {
    title: "Data Encryption",
    description: "All data encrypted at rest and in transit using industry-standard protocols.",
    icon: Lock,
  },
  {
    title: "KYC Automation",
    description: "Automated ID verification with real-time OCR and validation.",
    icon: FileCheck,
  },
  {
    title: "Consent Management",
    description: "Dynamic consent forms with full audit trails for compliance.",
    icon: ShieldCheck,
  },
  {
    title: "Tenant Isolation",
    description: "Complete data isolation between tenants with RLS policies.",
    icon: Server,
  },
  {
    title: "Secure Payments",
    description: "PCI-DSS compliant payment processing with instant verification.",
    icon: Wallet,
  },
  {
    title: "Access Controls",
    description: "Role-based access with granular permissions and audit logs.",
    icon: Users,
  },
];

const complianceItems = [
  {
    title: "SOC 2 Type II",
    description: "Security, availability, and confidentiality controls verified.",
    status: "In Progress",
  },
  {
    title: "GDPR Compliant",
    description: "Data processing agreements and right to erasure support.",
    status: "Complete",
  },
  {
    title: "PCI-DSS Level 1",
    description: "Highest level of payment card security certification.",
    status: "Complete",
  },
  {
    title: "ISO 27001",
    description: "Information security management system certification.",
    status: "In Progress",
  },
];

const securityFeatures = [
  "End-to-end encryption for all communications",
  "Multi-factor authentication support",
  "SSO integration with major identity providers",
  "Automated session timeout and logout",
  "IP allowlisting for API access",
  "Real-time security monitoring and alerts",
  "Encrypted backup and disaster recovery",
  "Zero-trust architecture principles",
];

const dataHandling = [
  {
    category: "What We Store",
    items: [
      "Customer profiles and conversation history",
      "Booking and transaction records",
      "Business rules and configuration",
      "Payment verification status",
    ],
  },
  {
    category: "What We Don't Store",
    items: [
      "Raw payment card data (tokenized only)",
      "Unencrypted personal identifiers",
      "Conversation audio/video files",
      "Third-party system credentials",
    ],
  },
];

export default function TrustPage() {
  return (
    <div className="relative pb-32 pt-36 sm:pt-48 lg:pt-56 overflow-hidden">
      <div className="public-container relative z-10 space-y-32">
        {/* HERO */}
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
            <Shield className="w-4 h-4" />
            <span>Trust & Security</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display max-w-5xl text-6xl leading-[1.1] text-foreground sm:text-7xl lg:text-8xl tracking-tighter"
          >
            Your data is <span className="text-gradient-primary">protected</span>.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-zinc-400 font-sans"
          >
            Enterprise-grade security, compliance, and data protection built into every layer of Nodebase.
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
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/company/contact"
              className="rounded-full glass-panel px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2"
            >
              Talk to Security Team
            </Link>
          </motion.div>
        </section>

        {/* TRUST PILLARS */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-4xl text-white tracking-tighter">
              Built on security-first principles
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Every feature is designed with security and compliance at its core.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustPillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={reveal}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-panel p-8 rounded-[2rem]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-6">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                    {pillar.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* COMPLIANCE */}
        <section className="glass-panel p-12 sm:p-16 rounded-[2.5rem]">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-white tracking-tighter">
              Compliance & Certifications
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Industry-leading standards and certifications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {complianceItems.map((item) => (
              <div key={item.title} className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{item.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                  item.status === "Complete" 
                    ? "bg-success/10 text-success border border-success/20" 
                    : "bg-warning/10 text-warning border border-warning/20"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SECURITY FEATURES */}
        <section className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
            className="space-y-6"
          >
            <h2 className="font-display text-3xl text-white tracking-tighter">
              Security features at every layer
            </h2>
            <ul className="space-y-4">
              {securityFeatures.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
            className="space-y-6"
          >
            {dataHandling.map((section) => (
              <div key={section.category} className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4">{section.category}</h3>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <span className="text-zinc-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="font-display text-4xl text-white tracking-tighter mb-6">
            Questions about security?
          </h2>
          <p className="text-lg text-zinc-400 mb-8">
            Our security team is here to help with any questions.
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
              Contact Security Team
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
