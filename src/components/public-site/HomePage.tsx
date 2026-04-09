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
    description: "Deploy specialized agents (Thrift AI, Nurse AI, Dukan AI, Host AI) tailored to your exact business vertical.",
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
  { name: "GreenView Stays", type: "Airbnb Host", logo: "🏡" },
  { name: "Wellness Clinic", type: "Doctor's Office", logo: "🏥" },
  { name: "Kirana Direct", type: "Retail Store", logo: "🛒" },
  { name: "ThriftHub", type: "Second-hand Store", logo: "👕" },
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
            className="font-display max-w-5xl text-6xl leading-[1.1] text-foreground sm:text-7xl lg:text-8xl tracking-tighter"
          >
            The autonomous workforce for{" "}
            <span className="text-gradient-primary">modern enterprises.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-zinc-400 font-sans"
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
              className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 border border-blue-400/50 shadow-[0_0_30px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] px-8 py-4 text-sm font-bold text-white hover:shadow-[0_0_40px_rgba(37,99,235,0.7)] hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              Deploy AI Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features"
              className="rounded-full glass-panel px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2"
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
              <div key={metric.label} className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                  {metric.label}
                </div>
                <div className="mt-2 text-lg font-bold text-white tracking-tight">
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
              <div className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">Unified Inbox</div>
              <h2 className="font-display text-4xl text-white tracking-tighter leading-[1.1]">
                Every customer interaction, instantly resolved.
              </h2>
            </div>

            <div className="space-y-4">
              <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-blue-500 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-sm font-bold text-white">Homestay Booking</div>
                  <div className="text-xs text-zinc-400 mt-1">Kaisa answered a question about parking and sent a booking link.</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] text-blue-400 tracking-widest uppercase font-bold">Pending</span>
              </div>
              
              <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-purple-500 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-sm font-bold text-white">Clinic Appointment</div>
                  <div className="text-xs text-zinc-400 mt-1">Patient asked a complex question. AI paused for your review.</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/50 text-[10px] text-purple-300 tracking-widest uppercase font-bold animate-pulse">Manual Review</span>
              </div>
              
              <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-sm font-bold text-white">Store Order</div>
                  <div className="text-xs text-zinc-400 mt-1">Payment received. Customer confirmed delivery address.</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">Paid</span>
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
              <div className="inline-flex py-1.5 px-4 rounded-full bg-white/5 border border-white/10 font-sans text-xs font-semibold tracking-wide w-fit text-zinc-300 mb-6">
                Practical Launch Sequence
              </div>
              <h2 className="font-display text-3xl text-white tracking-tighter leading-tight mb-8">
                Ship with the operating model attached.
              </h2>
              <div className="space-y-6">
                {operatingSequence.map((step, index) => (
                  <div key={step} className="flex gap-4 items-start group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass-panel group-hover:border-blue-500/50 transition-colors text-sm font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                      0{index + 1}
                    </div>
                    <p className="text-sm font-medium text-zinc-300 pt-1 group-hover:text-white transition-colors">
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500">
                  <Clock3 className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm font-bold text-white">
                  Never lose a sale because you replied too late.
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
                className="glass-panel p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-500 group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-white tracking-tight">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-400">
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
              <div className="inline-flex py-1.5 px-4 rounded-full glass-panel border border-white/10 font-sans text-xs font-semibold tracking-wide text-zinc-300">
                Choose the employee
              </div>
              <h2 className="font-display mt-6 text-4xl text-white sm:text-5xl tracking-tighter leading-tight">
                Hire by business lane, not general-purpose model.
              </h2>
            </div>
            <Link
              href="/pricing"
              className="rounded-full glass-panel px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10"
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
                    <div className="glass-panel group h-full p-8 rounded-[2rem] hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)] hover:border-blue-500/30">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:bg-blue-500/20 group-hover:text-blue-400 group-hover:border-blue-500/50 transition-colors">
                          {Icon ? <Icon className="h-6 w-6" /> : null}
                        </div>
                        {item.stat && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                            {item.stat}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                        {item.eyebrow}
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-400 h-[72px]">
                        {item.description}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
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
          <div className="text-center mb-8">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Trusted by businesses across</div>
            <div className="text-sm font-bold text-zinc-400">Homestays • Clinics • Retail • Social Commerce</div>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {socialProof.map((business) => (
              <div key={business.name} className="flex items-center gap-3 glass-panel px-6 py-4 rounded-2xl">
                <span className="text-2xl">{business.logo}</span>
                <div>
                  <div className="text-sm font-bold text-white">{business.name}</div>
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
            <div className="text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">Why Businesses Switch</div>
            <h2 className="font-display text-4xl text-white tracking-tighter leading-[1.1]">
              The #1 Kommo & Respond.io Alternative
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Stop paying $15-45/user/month for generic chatbots. NodeBase offers domain-specific AI agents 
              at a flat ₹999/month with Voice + Vision + KYC built-in.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-left p-4 font-bold text-zinc-400">Feature</th>
                  <th className="w-32 p-4 font-bold text-center text-emerald-400">NodeBase</th>
                  <th className="w-32 p-4 font-bold text-center text-zinc-500">Kommo</th>
                  <th className="w-32 p-4 font-bold text-center text-zinc-500">Respond.io</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white/5 border-b border-white/5">
                  <td className="p-4 text-sm text-white">Price</td>
                  <td className="p-4 text-center text-sm font-bold text-emerald-400">₹999/mo</td>
                  <td className="p-4 text-center text-sm text-zinc-400">$15+/user</td>
                  <td className="p-4 text-center text-sm text-zinc-400">$79+/mo</td>
                </tr>
                <tr className="bg-black/20 border-b border-white/5">
                  <td className="p-4 text-sm text-white">Domain-Specific AI</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                </tr>
                <tr className="bg-white/5 border-b border-white/5">
                  <td className="p-4 text-sm text-white">Voice Calls Included</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  <td className="p-4 text-center text-xs text-zinc-500">$279+ tier</td>
                </tr>
                <tr className="bg-black/20 border-b border-white/5">
                  <td className="p-4 text-sm text-white">Vision/OCR</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                </tr>
                <tr className="bg-white/5">
                  <td className="p-4 text-sm text-white">Automated KYC</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /></td>
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3 glass-panel text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm"
            >
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="glass-panel-glow p-12 sm:p-20 rounded-[3rem] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex py-1 px-4 rounded-full border border-blue-400/30 bg-blue-500/10 text-[10px] uppercase font-bold tracking-widest text-blue-400 mb-8 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              Ready to deploy
            </div>
            <h2 className="font-display text-5xl sm:text-6xl text-white tracking-tighter leading-tight max-w-3xl mb-12">
              Launch with the right employee and the right controls.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-white text-black px-10 py-4 text-sm font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                Start Building Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/company/contact"
                className="rounded-full glass-panel border border-white/20 px-10 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center"
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
