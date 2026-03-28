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
  type LucideIcon,
} from "lucide-react";
import { employeeDirectoryPage } from "@/lib/public-content";

const heroMetrics = [
  { label: "Enterprise Core", value: "Starts at ₹999/mo" },
  { label: "Multimodal AI", value: "Voice, Vision & Text" },
  { label: "Trust Center", value: "Automated KYC OCR" },
];

const workflowPillars: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Autonomous AI Staff",
    description:
      "Deploy specialized agents (Thrift AI, Nurse AI, Dukan AI, Host AI) tailored to your exact business vertical.",
    icon: Sparkles,
  },
  {
    title: "Nodebase Voice & Eyes",
    description:
      "Handle live customer phone calls natively via Twilio and ingest vision data like menus or IDs with OCR.",
    icon: Waypoints,
  },
  {
    title: "Enterprise Trust",
    description:
      "Bank-grade compliance with built-in KYC verification, automated consent forms, and dynamic pricing rules.",
    icon: ShieldCheck,
  },
];

const operatingSequence = [
  "Connect your WhatsApp, Instagram, or Website.",
  "Tell Kaisa your rules (like check-in times or pricing).",
  "Let the AI answer questions and take bookings 24/7.",
];

const controlCards = [
  {
    eyebrow: "Unified Operations",
    title: "Centralized Customer Portal",
    body: "Oversee omnichannel routing, secure payment links, and AI-driven inbox management from a singular, high-performance dashboard.",
    icon: Activity,
  },
  {
    eyebrow: "Intelligent Logic",
    title: "Dynamic compute & forms",
    body: "Implement dynamic pricing engines and automated KYC consent forms that scale frictionlessly with your operating volume.",
    icon: CreditCard,
  },
  {
    eyebrow: "Multimodal AI",
    title: "Nodebase Voice & Eyes",
    body: "Live Twilio telephony, instant omnichannel messaging, and zero-latency image ingestion for menus and IDs—natively processed.",
    icon: BookOpenText,
  },
];

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export function HomePage() {
  return (
    <div className="pb-20 pt-28 sm:pt-32 lg:pt-36">
      <div className="public-container space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
          <motion.section
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.5 }}
            className="glass-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10"
          >
            <div className="absolute right-[-5rem] top-[-3rem] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(26,115,232,0.15),transparent_68%)] animate-pulse" />
            <div className="absolute bottom-[-6rem] left-[-5rem] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(26,115,232,0.05),transparent_72%)]" />
            <div className="relative z-10 space-y-10">
              <div className="space-y-8">
                <div className="inline-flex py-1.5 px-4 rounded-full bg-primary/5 text-primary border border-primary/20 font-sans text-xs font-semibold tracking-wide">
                  The Enterprise AI Workforce
                </div>
                <h1 className="font-display max-w-4xl text-5xl leading-tight text-foreground sm:text-6xl lg:text-[5.5rem] lg:leading-[1.05] tracking-tight">
                  The autonomous workforce for modern enterprises.
                </h1>
                <p className="max-w-xl text-lg sm:text-xl leading-relaxed text-muted-foreground font-sans">
                  Deploy domain-specific AI employees—capable of autonomous voice, vision, and transactional workflows—to scale your operations instantly. Fast, secure, and built for scale.
                </p>
              </div>
 
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="public-button px-8 py-4 text-sm"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/company/contact"
                  className="public-button-secondary px-8 py-4 text-sm"
                >
                  Talk to Sales
                </Link>
              </div>


              <div className="grid gap-4 md:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="public-inset p-5 border-l-4 border-l-primary/30">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary">{metric.label}</div>
                    <div className="mt-2 text-base font-bold text-foreground">
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <div className="grid gap-4">
            <motion.section
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-panel p-5 sm:p-6"
            >
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold tracking-wide text-primary">Unified Inbox</div>
                    <h2 className="font-display mt-3 text-3xl text-foreground tracking-tight leading-tight">
                      Everything in one place
                    </h2>
                  </div>
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4.8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/10"
                  >
                    <Sparkles className="h-7 w-7" />
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <div className="public-inset flex items-center justify-between gap-4 px-5 py-4 border-l-4 border-l-primary/10">
                    <div>
                      <div className="text-sm font-bold text-foreground uppercase tracking-tight">
                        Homestay Booking
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Kaisa answered a question about parking and sent a
                        booking link.
                      </div>
                    </div>
                    <span className="public-pill text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted border border-border">
                      Pending
                    </span>
                  </div>
                  <div className="public-inset flex items-center justify-between gap-4 px-5 py-4 border-l-4 border-l-primary/40">
                    <div>
                      <div className="text-sm font-bold text-foreground uppercase tracking-tight">
                        Clinic Appointment
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Patient asked a complex question. AI paused for your
                        review.
                      </div>
                    </div>
                    <span className="public-pill text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/20 animate-pulse">
                      Manual review
                    </span>
                  </div>
                  <div className="public-inset flex items-center justify-between gap-4 px-5 py-4 border-l-4 border-l-emerald-500/30">
                    <div>
                      <div className="text-sm font-bold text-foreground uppercase tracking-tight">
                        Store Order
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Payment received. Customer confirmed delivery address.
                      </div>
                    </div>
                    <span className="public-pill text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
                      Paid
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-center gap-3 text-sm font-bold text-foreground uppercase tracking-tight">
                    <Clock3 className="h-5 w-5 text-primary" />
                    Never lose a sale because you replied too late.
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {controlCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <motion.section
                    key={card.title}
                    initial="hidden"
                    animate="visible"
                    variants={reveal}
                    transition={{ duration: 0.45, delay: 0.14 + index * 0.08 }}
                    className="glass-card p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="public-inset flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-primary/20">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold tracking-wide text-primary">{card.eyebrow}</div>
                        <h3 className="mt-2 text-lg font-semibold text-foreground tracking-tight">
                          {card.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {card.body}
                        </p>
                      </div>
                    </div>
                  </motion.section>
                );
              })}
            </div>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-3">
          {workflowPillars.map((pillar, index) => {
            const Icon = pillar.icon;

            return (
              <motion.div
                key={pillar.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={reveal}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="glass-card p-6"
              >
                <div className="public-inset flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-primary/20">
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="mt-6 text-xl font-semibold text-foreground tracking-tight">
                  {pillar.title}
                </h2>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </section>

        <section className="glass-panel p-6 sm:p-12 lg:p-16">
          <div className="relative z-10 space-y-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <div className="inline-flex py-1.5 px-4 rounded-full bg-primary/5 text-primary border border-primary/20 font-sans text-xs font-semibold tracking-wide">
                  Choose the employee
                </div>
                <h2 className="font-display mt-6 text-4xl text-foreground sm:text-5xl tracking-tight leading-tight">
                  Hire by business lane, not general-purpose model
                </h2>
              </div>
              <Link
                href="/pricing"
                className="public-button-secondary px-8 py-4 text-sm"
              >
                See pricing
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {employeeDirectoryPage.cards.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={reveal}
                    transition={{ duration: 0.45, delay: index * 0.07 }}
                  >
                    <Link
                      href={item.href || "/employees"}
                      className="block h-full"
                    >
                      <div className="glass-card group h-full p-6 transition-transform duration-200 hover:-translate-y-1 hover:bg-white/60 dark:hover:bg-white/5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="public-inset flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-primary/20">
                            {Icon ? <Icon className="h-6 w-6" /> : null}
                          </div>
                          {item.stat ? (
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
                              {item.stat}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-6">
                          {item.eyebrow}
                        </div>
                        <h3 className="mt-2 text-xl font-bold text-foreground uppercase tracking-tight">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground font-sans">
                          {item.description}
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-primary">
                          {item.ctaLabel || "Open"}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(18rem,1.14fr)]">
          <section className="glass-card p-8 sm:p-12 border-l-4 border-l-primary/20">
            <div className="space-y-6">
              <div className="inline-flex py-1.5 px-4 rounded-full bg-primary/5 text-primary border border-primary/20 font-sans text-xs font-semibold tracking-wide w-fit">
                Rollout Posture
              </div>
              <h2 className="font-display mt-6 text-4xl text-foreground sm:text-5xl tracking-tight leading-tight">
                Upgrade the workflow, then the page surface.
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground font-sans max-w-2xl">
                The public site now reflects a higher signal product: role-based
                employees, documented controls, stronger legal surfaces, and
                clearer deployment logic.
              </p>
              <div className="grid gap-4 max-w-md">
                <Link
                  href="/trust"
                  className="public-inset flex items-center justify-between rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-tight text-foreground hover:border-primary/30 transition-all"
                >
                  Trust center
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Link>
                <Link
                  href="/docs"
                  className="public-inset flex items-center justify-between rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-tight text-foreground hover:border-primary/30 transition-all"
                >
                  Documentation
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Link>
                <Link
                  href="/company"
                  className="public-inset flex items-center justify-between rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-tight text-foreground hover:border-primary/30 transition-all"
                >
                  Company and partner model
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Link>
              </div>
            </div>
          </section>

          <section className="glass-panel p-8 sm:p-12">
            <div className="relative z-10 space-y-8">
              <div>
                <div className="inline-flex py-1.5 px-4 rounded-full bg-primary/5 text-primary border border-primary/20 font-sans text-xs font-semibold tracking-wide">
                  Practical Launch Sequence
                </div>
                <h2 className="font-display mt-6 text-4xl text-foreground tracking-tight leading-tight">
                  Ship with the operating model attached.
                </h2>
              </div>
              <div className="space-y-4">
                {operatingSequence.map((step, index) => (
                  <div
                    key={step}
                    className="public-inset flex gap-6 rounded-2xl px-6 py-5 border-l-4 border-l-primary/10"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-foreground shadow-lg shadow-primary/20">
                      0{index + 1}
                    </div>
                    <p className="text-base font-bold text-foreground uppercase tracking-tight leading-snug">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="glass-panel p-8 sm:p-16 lg:p-24 bg-primary/5">
          <div className="relative z-10 flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex py-1.5 px-4 rounded-full bg-primary/5 text-primary border border-primary/20 font-sans text-xs font-semibold tracking-wide">
                Ready to deploy
              </div>
              <h2 className="font-display mt-8 text-5xl text-foreground sm:text-6xl lg:text-[4.5rem] tracking-tight leading-tight">
                Launch with the right employee and the right controls.
              </h2>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/company/contact"
                className="public-button px-10 py-5 text-sm"
              >
                Talk to Nodebase
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/employees"
                className="public-button-secondary px-10 py-5 text-sm"
              >
                Browse employees
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
