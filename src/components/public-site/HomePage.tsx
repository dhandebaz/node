"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BookOpenText,
  Clock3,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Waypoints,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { employeeDirectoryPage } from "@/lib/public-content";

const heroMetrics = [
  { label: "Price Comparison", value: "23x Cheaper than Respond.io" },
  { label: "Multimodal AI", value: "Voice, Vision & Text" },
  { label: "Setup Time", value: "5 Minutes" },
];

const workflowPillars: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Autonomous AI Staff",
    description: "Deploy specialized agents (Thrift AI, Nurse AI, Dukan AI, Omni AI) tailored to your exact business vertical.",
    icon: Sparkles,
  },
  {
    title: "Nodebase Voice & Eyes",
    description: "Handle live customer phone calls natively via Twilio and ingest vision data like menus or IDs with OCR.",
    icon: Waypoints,
  },
  {
    title: "Enterprise Trust",
    description: "Bank-grade compliance with built-in KYC verification, automated consent forms, and dynamic pricing rules.",
    icon: ShieldCheck,
  },
];

const operatingSequence = [
  "Connect your WhatsApp, Instagram, or Website.",
  "Tell Kaisa your rules (like check-in times or pricing).",
  "Let the AI answer questions and take bookings 24/7.",
];

const socialProof = [
  { name: "Apex Operations", type: "Service Firm", logo: "🏢" },
  { name: "Wellness Clinic", type: "Doctor's Office", logo: "🏥" },
  { name: "Kirana Direct", type: "Retail Store", logo: "🛒" },
  { name: "ThriftHub", type: "Social Commerce", logo: "📱" },
];

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function HomePage() {
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] -z-10 pointer-events-none"
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-blue-500/30 text-xs font-semibold tracking-wide text-blue-400 mb-8 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>The Enterprise AI Workforce</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display max-w-5xl text-6xl leading-[1.1] text-zinc-950 sm:text-7xl lg:text-8xl tracking-tighter"
          >
            The autonomous workforce for{" "}
            <span className="text-gradient-primary">modern enterprises.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-zinc-600 font-sans"
          >
            Deploy domain-specific AI employees - capable of autonomous voice, vision, and transactional workflows - to scale your operations instantly.
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
              className="rounded-full bg-blue-600 border border-blue-500 shadow-md px-8 py-4 text-sm font-bold text-white hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              Deploy AI Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features"
              className="rounded-full bg-white border border-zinc-200 px-8 py-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-all flex items-center gap-2 shadow-sm"
            >
              View Features
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl"
          >
            {heroMetrics.map((metric, i) => (
              <div key={metric.label} className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group border border-zinc-100 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  {metric.label}
                </div>
                <div className="mt-2 text-lg font-bold text-zinc-950 tracking-tight">
                  {metric.value}
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* UNIFIED INBOX SPLIT SECTION */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
            className="glass-panel-glow p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-pulse">
                <Sparkles className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            
            <div className="space-y-6 max-w-lg mb-12">
              <div className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase">Unified Inbox</div>
              <h2 className="font-display text-4xl text-zinc-950 tracking-tighter leading-[1.1]">
                Every customer interaction, instantly resolved.
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm border-l-4 border-l-emerald-500 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div>
                  <div className="text-sm font-bold text-zinc-900">Retail Order</div>
                  <div className="text-xs text-zinc-500 mt-1">Dukan AI confirmed the SKU and generated a payment link.</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-600 tracking-widest uppercase font-bold">Paid</span>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm border-l-4 border-l-purple-500 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div>
                  <div className="text-sm font-bold text-zinc-900">Clinic Appointment</div>
                  <div className="text-xs text-zinc-500 mt-1">Nurse AI booked a consultation for tomorrow at 10 AM.</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[10px] text-purple-600 tracking-widest uppercase font-bold">Confirmed</span>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm border-l-4 border-l-blue-500 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div>
                  <div className="text-sm font-bold text-zinc-900">Project Inquiry</div>
                  <div className="text-xs text-zinc-500 mt-1">Client asked about pricing. AI shared the service deck.</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] text-blue-600 tracking-widest uppercase font-bold">Responded</span>
              </div>
            </div>
          </motion.section>

          <div className="flex flex-col gap-6">
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={reveal}
              className="glass-panel p-8 rounded-[2.5rem] flex-1 flex flex-col justify-center"
            >
              <div className="inline-flex py-1.5 px-4 rounded-full bg-zinc-100 border border-zinc-200 font-sans text-xs font-semibold tracking-wide w-fit text-zinc-600 mb-6">
                Practical Launch Sequence
              </div>
              <h2 className="font-display text-3xl text-zinc-950 tracking-tighter leading-tight mb-8">
                Ship with the operating model attached.
              </h2>
              <div className="space-y-6">
                {operatingSequence.map((step, index) => (
                  <div key={step} className="flex gap-4 items-start group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 group-hover:border-blue-500/50 transition-colors text-sm font-bold text-zinc-950 shadow-sm">
                      0{index + 1}
                    </div>
                    <p className="text-sm font-medium text-zinc-600 pt-1 group-hover:text-zinc-950 transition-colors">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
            
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={reveal}
              className="glass-panel p-6 rounded-[2.5rem] border border-blue-500/30 bg-blue-500/5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                  <Clock3 className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm font-bold text-blue-800">
                  Never lose a client because you replied too late.
                </div>
              </div>
            </motion.section>
          </div>
        </div>

        {/* PILLARS SECTION */}
        <section className="grid sm:grid-cols-3 gap-6">
          {workflowPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={reveal}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm hover:-translate-y-2 transition-transform duration-500 group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-200 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-zinc-950 tracking-tight">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </section>

        {/* EMPLOYEES GRID */}
        <section className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex py-1.5 px-4 rounded-full bg-zinc-100 border border-zinc-200 font-sans text-xs font-semibold tracking-wide text-zinc-600">
                Choose the employee
              </div>
              <h2 className="font-display mt-6 text-4xl text-zinc-950 sm:text-5xl tracking-tighter leading-tight">
                Hire by business lane, not general-purpose model.
              </h2>
            </div>
            <Link
              href="/pricing"
              className="rounded-full bg-white border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-all flex items-center gap-2 shadow-sm"
            >
              See pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {employeeDirectoryPage.cards.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={reveal}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={item.href || "/employees"} className="block h-full">
                    <div className="bg-white group h-full p-8 rounded-[2rem] border border-zinc-100 shadow-sm hover:-translate-y-2 transition-all duration-500 hover:shadow-lg hover:border-blue-200">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {Icon ? <Icon className="h-6 w-6" /> : null}
                        </div>
                        {item.stat && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                            {item.stat}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                        {item.eyebrow}
                      </div>
                      <h3 className="text-xl font-bold text-zinc-950 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-600 h-[72px]">
                        {item.description}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                        {item.ctaLabel || "View Setup"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="py-8">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Trusted by businesses across</div>
          <div className="text-sm font-bold text-zinc-400">Professional Services • Clinics • Retail • Social Commerce</div>
          <div className="flex flex-wrap justify-center gap-6">
            {socialProof.map((business) => (
              <div key={business.name} className="flex items-center gap-3 bg-white border border-zinc-100 shadow-sm px-6 py-4 rounded-2xl">
                <span className="text-2xl">{business.logo}</span>
                <div>
                  <div className="text-sm font-bold text-zinc-950">{business.name}</div>
                  <div className="text-xs text-zinc-500">{business.type}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WHY NODEBASE - Competitive Comparison */}
        <section className="glass-panel-glow p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Activity className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          
          <div className="space-y-6 max-w-3xl mb-12">
            <div className="text-xs font-bold tracking-[0.2em] text-emerald-600 uppercase">Why Businesses Switch</div>
            <h2 className="font-display text-4xl text-zinc-950 tracking-tighter leading-[1.1]">
              The #1 Kommo & Respond.io Alternative
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              Stop paying $15-45/user/month for generic chatbots. NodeBase offers domain-specific AI agents 
              at a flat ₹999/month with Voice + Vision + KYC built-in.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm bg-white">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="text-left p-4 font-bold text-zinc-600">Feature</th>
                  <th className="w-32 p-4 font-bold text-center text-emerald-600">NodeBase</th>
                  <th className="w-32 p-4 font-bold text-center text-zinc-400">Kommo</th>
                  <th className="w-32 p-4 font-bold text-center text-zinc-400">Respond.io</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 bg-white">
                  <td className="p-4 text-sm text-zinc-900">Price</td>
                  <td className="p-4 text-center text-sm font-bold text-emerald-600">₹999/mo</td>
                  <td className="p-4 text-center text-sm text-zinc-500">$15+/user</td>
                  <td className="p-4 text-center text-sm text-zinc-500">$79+/mo</td>
                </tr>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <td className="p-4 text-sm text-zinc-900">Domain-Specific AI</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                </tr>
                <tr className="bg-white border-b border-zinc-100">
                  <td className="p-4 text-sm text-zinc-900">Voice Calls Included</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  <td className="p-4 text-center text-xs text-zinc-400">$279+ tier</td>
                </tr>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <td className="p-4 text-sm text-zinc-900">Vision/OCR</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                </tr>
                <tr className="bg-white">
                  <td className="p-4 text-sm text-zinc-900">Automated KYC</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/compare"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/20 transition-all text-sm"
            >
              Full Comparison <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-950 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all text-sm shadow-md"
            >
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="glass-panel-glow p-12 sm:p-20 rounded-[3rem] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex py-1 px-4 rounded-full border border-blue-200 bg-blue-50 text-[10px] uppercase font-bold tracking-widest text-blue-600 mb-8">
              Ready to deploy
            </div>
            <h2 className="font-display text-5xl sm:text-6xl text-zinc-950 tracking-tighter leading-tight max-w-3xl mb-12">
              Launch with the right employee and the right controls.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-blue-600 text-white px-10 py-4 text-sm font-bold hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Start Building Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/company/contact"
                className="rounded-full bg-white border border-zinc-200 px-10 py-4 text-sm font-bold text-zinc-900 hover:bg-zinc-50 transition-colors flex items-center justify-center shadow-sm"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
