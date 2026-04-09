"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Headphones,
  ShieldCheck,
  Sparkles,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const pricingFrames = [
  {
    title: "Enterprise Core",
    price: "From ₹999/mo",
    eyebrow: "Foundation",
    description:
      "Secure foundational infrastructure for deploying autonomous AI employees, featuring our unified omnichannel portal.",
    highlights: [
      "1 Domain-specific AI Employee",
      "Unified Voice, Vision & Chat inbox",
      "Automated KYC & payment processing",
    ],
    icon: ShieldCheck,
    featured: true,
  },
  {
    title: "Pay as you go",
    price: "Usage-based",
    eyebrow: "Messages",
    description:
      "You only pay for the messages your AI actually sends. No flat fees for things you don't use.",
    highlights: [
      "Pay per AI reply",
      "No commissions on your sales",
      "Set your own spending limits",
    ],
    icon: WalletCards,
  },
  {
    title: "Expert Setup",
    price: "One-time fee",
    eyebrow: "Optional",
    description:
      "Need help getting started? We'll map your business rules and connect your WhatsApp for you.",
    highlights: [
      "Done-for-you WhatsApp setup",
      "Custom AI training on your rules",
      "1-on-1 launch call",
    ],
    icon: Headphones,
  },
];

const operatingRules = [
  "You keep 100% of your revenue. We never take a cut of your sales or service fees.",
  "You can pause the AI at any time and reply to clients yourself.",
  "Stop paying flat monthly fees. Pay only for the messages your AI successfully answers.",
];

const sampleLedger = [
  { label: "Enterprise Core License", value: "₹999" },
  { label: "1,200 Autonomous AI Interactions", value: "Usage-based" },
  { label: "KYC OCR & Secure Payments", value: "Included" },
  { label: "Multi-seat human overrides", value: "Included" },
];

const faq = [
  {
    question: "Do you charge commission on sales or service fees?",
    answer:
      "Never. You keep 100% of your revenue. We only charge a flat subscription for the software and a tiny usage fee per AI message.",
  },
  {
    question: "How does NodeBase compare to Kommo or Respond.io?",
    answer:
      "NodeBase offers domain-specific AI agents (not generic bots), Voice + Vision included, and automated KYC - all at ₹999/mo flat vs Kommo's $15+/user/mo and Respond.io's $79-349/mo. We also don't charge per-user fees.",
  },
  {
    question: "Why is NodeBase cheaper than Respond.io?",
    answer:
      "Respond.io charges $79-349/month plus $12/user extra and AI add-ons. For a 10-person team, you'd pay $279+/month. NodeBase charges ₹999/month (~$12) flat with everything included.",
  },
  {
    question: "Can I jump in and reply to clients myself?",
    answer:
      "Yes! You can pause the AI at any time with one click and take over the conversation from your dashboard.",
  },
  {
    question: "Do I need technical skills to set this up?",
    answer:
      "No. If you can fill out a simple form with your business rules (like pricing or service details), you can use our platform.",
  },
  {
    question: "What if the AI doesn't know the answer?",
    answer:
      "If a customer asks a complicated question, the AI will politely pause and notify you to take over the chat.",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

type Frame = (typeof pricingFrames)[number];

function PricingCard({ frame, index }: { frame: Frame; index: number }) {
  const Icon = frame.icon as LucideIcon;

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={reveal}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "p-8 sm:p-10 rounded-[2.5rem] relative flex flex-col h-full overflow-hidden transition-all duration-500",
        frame.featured ? "glass-panel-glow border-blue-500/50 hover:shadow-[0_20px_60px_rgba(59,130,246,0.3)]" : "glass-panel hover:shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
      )}
    >
      {frame.featured && (
         <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      )}
      <div className="relative z-10 flex-grow flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm border",
            frame.featured ? "bg-blue-600 border-blue-500 text-white shadow-blue-200" : "bg-zinc-50 border-zinc-200 text-zinc-900"
          )}>
            <Icon className="h-7 w-7" />
          </div>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border",
            frame.featured ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-zinc-50 border-zinc-200 text-zinc-500"
          )}>
            {frame.eyebrow}
          </span>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">
            {frame.title}
          </h2>
          <div className={cn(
            "mt-4 text-3xl font-black uppercase tracking-tighter",
            frame.featured ? "text-blue-600" : "text-zinc-900"
          )}>
            {frame.price}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-zinc-600 font-sans h-[60px]">
            {frame.description}
          </p>
        </div>
        
        <ul className="space-y-4 pt-8 mt-auto flex-grow flex flex-col justify-end">
          {frame.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex items-start gap-3 text-sm font-semibold text-zinc-700"
            >
              <CheckCircle2 className={cn("h-5 w-5 shrink-0", frame.featured ? "text-blue-600" : "text-zinc-300")} />
              <span className="pt-0.5">{highlight}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export function PricingSurface() {
  return (
    <div className="relative pb-32 pt-36 sm:pt-48 lg:pt-56 overflow-hidden">
      <div className="public-container relative z-10 space-y-32">
        {/* HERO */}
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] items-center">
          <motion.section
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex py-1.5 px-4 rounded-full glass-panel border border-blue-500/30 font-sans text-xs font-semibold tracking-wide text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Sparkles className="w-4 h-4 mr-2 inline-block -translate-y-px" />
              Pricing Architecture
            </div>
            <h1 className="font-display max-w-3xl text-5xl leading-[1.1] text-zinc-950 sm:text-6xl lg:text-7xl tracking-tighter">
              Predictable <span className="text-blue-600">operational</span> scale.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-zinc-600 font-sans">
              Nodebase pricing ensures transparent scale. You pay a core infrastructure licensing fee of ₹999/mo, plus highly optimized usage rates for omnichannel AI compute.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row pt-4">
              <Link
                 href="/company/contact"
                 className="rounded-full bg-blue-600 border border-blue-500 shadow-md px-8 py-4 text-sm font-bold text-white hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2 justify-center"
              >
                Scope a deployment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/getting-started/quickstart"
                className="rounded-full bg-white border border-zinc-200 px-8 py-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-all flex items-center justify-center shadow-sm"
              >
                Review the quickstart
              </Link>
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel p-8 sm:p-10 rounded-[2.5rem]"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-200 shadow-sm">
                  <CreditCard className="h-7 w-7 text-zinc-900" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Commercial posture</div>
                  <h2 className="text-xl font-bold text-zinc-950 tracking-tight mt-1">
                    Built for operators
                  </h2>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl px-5 py-4 border-l-2 border-l-blue-500 hover:bg-zinc-50 transition-colors border border-zinc-100 shadow-sm">
                  <div className="text-xs font-bold text-blue-600">Base</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900">
                    Subscription plus usage
                  </div>
                </div>
                <div className="bg-white rounded-2xl px-5 py-4 border-l-2 border-l-purple-500 hover:bg-zinc-50 transition-colors border border-zinc-100 shadow-sm">
                  <div className="text-xs font-bold text-purple-600">Revenue model</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900">
                    No commission on sales
                  </div>
                </div>
                <div className="bg-white rounded-2xl px-5 py-4 border-l-2 border-l-emerald-500 hover:bg-zinc-50 transition-colors border border-zinc-100 shadow-sm">
                  <div className="text-xs font-bold text-emerald-600">Operator control</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900">
                    Budget thresholds stay configurable
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* PRICING GRID */}
        <section className="grid gap-6 lg:grid-cols-3">
          {pricingFrames.map((frame, index) => (
            <PricingCard key={frame.title} frame={frame} index={index} />
          ))}
        </section>

        {/* LEDGER & RULES COMPONENT */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <section className="glass-panel p-8 sm:p-12 rounded-[2.5rem]">
            <div className="space-y-8">
              <div className="inline-flex py-1 px-4 rounded-full bg-zinc-100 border border-zinc-200 font-sans text-xs font-semibold tracking-wide text-zinc-600">
                How to think about spend
              </div>
              <h2 className="font-display text-4xl text-zinc-950 tracking-tighter leading-tight">
                Compare against manual drift.
              </h2>
              <div className="space-y-4">
                {operatingRules.map((rule) => (
                  <div
                    key={rule}
                    className="flex gap-4 items-start group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 group-hover:bg-zinc-100 transition-colors text-zinc-900 mt-1 shadow-sm">
                       <Activity className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm font-medium text-zinc-600 pt-1 group-hover:text-zinc-900 transition-colors leading-relaxed">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-panel-glow p-8 sm:p-12 rounded-[2.5rem] border border-blue-500/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 100) rotate(90) scale(100)">
                  <stop stopColor="#3B82F6" stopOpacity="0.5"/>
                  <stop offset="1" stopColor="#3B82F6" stopOpacity="0"/>
                </radialGradient>
                <circle cx="100" cy="100" r="100" fill="url(#paint0_radial)"/>
              </svg>
            </div>
            <div className="relative z-10 space-y-8 flex flex-col h-full">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Example monthly frame</div>
                <h2 className="font-display text-3xl text-zinc-950 tracking-tighter leading-tight mt-3">
                  A simple ledger.
                </h2>
              </div>
              <div className="space-y-3 mt-auto flex-grow flex flex-col justify-end">
                {sampleLedger.map((entry) => (
                  <div
                    key={entry.label}
                    className="flex items-center justify-between gap-6 rounded-2xl px-6 py-5 bg-white border border-zinc-100 hover:bg-zinc-50 transition-colors shadow-sm"
                  >
                    <div className="text-sm font-bold text-zinc-600">
                      {entry.label}
                    </div>
                    <div className="text-sm font-black text-zinc-950 tracking-wide">
                      {entry.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* FAQ SECTION */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="font-display text-4xl text-zinc-950 tracking-tighter">Frequently asked questions</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {faq.map((item, index) => (
              <motion.article
                key={item.question}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.22 }}
                variants={reveal}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="bg-white border border-zinc-100 shadow-sm p-8 rounded-[2rem] hover:-translate-y-1 transition-transform"
              >
                <h3 className="text-lg font-bold text-zinc-950 tracking-tight">
                  {item.question}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                  {item.answer}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* COMPETITIVE COMPARISON */}
        <section className="glass-panel-glow p-8 sm:p-12 rounded-[2.5rem] border border-emerald-500/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Activity className="h-7 w-7 text-emerald-400" />
            </div>
          </div>
          
          <div className="relative z-10 space-y-6 max-w-3xl mb-8">
            <div className="text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">
              Why NodeBase Wins
            </div>
            <h2 className="font-display text-4xl text-zinc-950 tracking-tighter leading-[1.1]">
              Why Pay $159+/month When You Get More at ₹999?
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              Compare NodeBase to Respond.io and Kommo. We offer domain-specific AI agents, 
              Voice + Vision capabilities, and automated KYC - all at a fraction of the cost.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
              <div className="text-xs font-bold text-emerald-600 mb-2">NodeBase</div>
              <div className="text-3xl font-black text-zinc-950 mb-1">₹999/mo</div>
              <div className="text-sm text-zinc-500">Flat rate, unlimited users</div>
              <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Voice + Vision included
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Domain-specific AI
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Automated KYC
                </li>
              </ul>
            </div>
            
            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 opacity-60">
              <div className="text-xs font-bold text-zinc-500 mb-2">Respond.io</div>
              <div className="text-3xl font-black text-zinc-900 mb-1">$79-349/mo</div>
              <div className="text-sm text-zinc-500">Plus user fees</div>
              <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                <li>Voice costs extra ($279+)</li>
                <li>Generic AI only</li>
                <li>No vision/OCR</li>
                <li>Per-user charges</li>
              </ul>
            </div>
            
            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 opacity-60">
              <div className="text-xs font-bold text-zinc-500 mb-2">Kommo</div>
              <div className="text-3xl font-black text-zinc-900 mb-1">$15-45/user</div>
              <div className="text-sm text-zinc-500">Min 1 user, 6-mo commitment</div>
              <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                <li>Basic AI only</li>
                <li>No voice capabilities</li>
                <li>No KYC built-in</li>
                <li>Scales EXPENSIVELY</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/compare"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/20 transition-all text-sm"
            >
              Full Feature Comparison <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all text-sm shadow-md"
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
               Commercial review
             </div>
             <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-zinc-950 tracking-tighter leading-tight max-w-4xl mb-12">
               If the workflow is real, we can price it clearly.
             </h2>
             <div className="flex flex-col sm:flex-row gap-4">
               <Link
                 href="/company/contact"
                 className="rounded-full bg-white text-black px-10 py-4 text-sm font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
               >
                 Talk to sales
                 <ArrowRight className="h-4 w-4" />
               </Link>
                <Link
                  href="/employees"
                  className="rounded-full bg-white border border-zinc-200 px-10 py-4 text-sm font-bold text-zinc-900 hover:bg-zinc-50 transition-colors flex items-center justify-center shadow-sm"
                >
                  Compare employees
                </Link>
                <Link
                  href="/features"
                  className="rounded-full bg-white border border-zinc-200 px-10 py-4 text-sm font-bold text-zinc-900 hover:bg-zinc-50 transition-colors flex items-center justify-center shadow-sm"
                >
                  View Features
                </Link>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
