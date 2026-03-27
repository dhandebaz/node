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
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const pricingFrames = [
  {
    title: "Base Subscription",
    price: "From INR 1,999/mo",
    eyebrow: "Foundation",
    description:
      "Everything you need to run your business inbox, including the AI assistant and unified dashboard.",
    highlights: [
      "One customized AI assistant",
      "Unified WhatsApp & Instagram inbox",
      "Automated payment collection",
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
  "You keep 100% of your revenue. We never take a cut of your bookings or sales.",
  "You can pause the AI at any time and reply to customers yourself.",
  "Stop paying flat monthly fees. Pay only for the messages your AI successfully answers.",
];

const sampleLedger = [
  { label: "Base Subscription", value: "INR 1,999" },
  { label: "1,200 AI replies sent to customers", value: "Usage-based" },
  { label: "Automated payment follow-ups", value: "Included" },
  { label: "Human inbox & manual replies", value: "Included" },
];

const faq = [
  {
    question: "Do you charge commission on bookings or orders?",
    answer:
      "Never. You keep 100% of your sales. We only charge a flat subscription for the software and a tiny usage fee per AI message.",
  },
  {
    question: "Can I jump in and reply to customers myself?",
    answer:
      "Yes! You can pause the AI at any time with one click and take over the conversation from your dashboard.",
  },
  {
    question: "Do I need technical skills to set this up?",
    answer:
      "No. If you can fill out a simple form with your business rules (like check-in times or prices), you can use our platform.",
  },
  {
    question: "What if the AI doesn't know the answer?",
    answer:
      "If a customer asks a complicated question, the AI will politely pause and notify you to take over the chat.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
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
      variants={fadeUp}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className={cn(
        "p-6 sm:p-8",
        frame.featured ? "public-panel border-b-8 border-primary" : "public-panel-soft",
      )}
    >
      <div className="relative z-10 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="public-inset flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-primary/20">
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
            {frame.eyebrow}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">
            {frame.title}
          </h2>
          <div className="mt-3 text-2xl font-black text-primary uppercase tracking-tighter">
            {frame.price}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground font-sans">
            {frame.description}
          </p>
        </div>
        <ul className="space-y-4 pt-2">
          {frame.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex gap-3 text-sm font-bold text-foreground uppercase tracking-tight"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export function PricingSurface() {
  return (
    <div className="pb-20 pt-28 sm:pt-32 lg:pt-36">
      <div className="public-container space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(18rem,0.98fr)]">
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="public-panel px-6 py-8 sm:px-12 sm:py-16 lg:px-16"
          >
            <div className="relative z-10 space-y-8">
              <div className="inline-flex py-1 px-3 rounded-full bg-primary/10 text-primary font-sans text-[10px] font-black uppercase tracking-[0.2em]">
                Pricing
              </div>
              <h1 className="font-display max-w-4xl text-5xl leading-[0.9] text-foreground sm:text-6xl lg:text-7xl uppercase tracking-tighter">
                Price the operating system, not the hype.
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground font-sans">
                Nodebase pricing is structured around the platform retainer,
                real usage, and rollout help where the workflow deserves it. The
                goal is practical economics with visible controls.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row pt-4">
                <Link
                   href="/company/contact"
                   className="public-button px-8 py-4 text-sm"
                >
                  Scope a deployment
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/docs/getting-started/quickstart"
                  className="public-button-secondary px-8 py-4 text-sm"
                >
                  Review the quickstart
                </Link>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="public-panel-soft p-6 sm:p-8"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="public-inset flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-primary/20">
                  <CreditCard className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary">Commercial posture</div>
                  <h2 className="text-xl font-bold text-foreground uppercase tracking-tight mt-1">
                    Built for operators
                  </h2>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="public-inset rounded-2xl px-5 py-4 border-l-4 border-l-primary/10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary">Base</div>
                  <div className="mt-2 text-base font-bold text-foreground uppercase tracking-tight">
                    Subscription plus usage
                  </div>
                </div>
                <div className="public-inset rounded-2xl px-5 py-4 border-l-4 border-l-primary/10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary">Revenue model</div>
                  <div className="mt-2 text-base font-bold text-foreground uppercase tracking-tight">
                    No commission on sales
                  </div>
                </div>
                <div className="public-inset rounded-2xl px-5 py-4 border-l-4 border-l-primary/10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary">Operator control</div>
                  <div className="mt-2 text-base font-bold text-foreground uppercase tracking-tight">
                    Budget thresholds stay configurable
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        <section className="grid gap-4 xl:grid-cols-3">
          {pricingFrames.map((frame, index) => (
            <PricingCard key={frame.title} frame={frame} index={index} />
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(18rem,1.12fr)]">
          <section className="public-panel-soft p-8 sm:p-12 border-l-4 border-l-primary/20">
            <div className="space-y-8">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                How to think about spend
              </div>
              <h2 className="font-display text-4xl text-foreground sm:text-5xl uppercase tracking-tighter leading-[0.9]">
                Compare against manual drift.
              </h2>
              <div className="space-y-4">
                {operatingRules.map((rule) => (
                  <div
                    key={rule}
                    className="public-inset flex gap-6 rounded-2xl px-6 py-5 border-l-4 border-l-primary/10"
                  >
                    <Activity className="h-6 w-6 shrink-0 text-primary" />
                    <p className="text-sm font-bold text-foreground uppercase tracking-tight leading-relaxed">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="public-panel p-8 sm:p-12 border-r-4 border-r-primary">
            <div className="relative z-10 space-y-8">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Example monthly frame</div>
              <h2 className="font-display text-4xl text-foreground uppercase tracking-tighter leading-[0.9]">
                A simple ledger.
              </h2>
              <div className="space-y-4">
                {sampleLedger.map((entry) => (
                  <div
                    key={entry.label}
                    className="public-inset flex items-center justify-between gap-6 rounded-2xl px-6 py-5 border-l-4 border-l-primary/10"
                  >
                    <div className="text-sm font-bold text-foreground uppercase tracking-tight">
                      {entry.label}
                    </div>
                    <div className="text-sm font-black text-primary uppercase tracking-widest">
                      {entry.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {faq.map((item, index) => (
            <motion.article
              key={item.question}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.22 }}
              variants={fadeUp}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="public-panel-soft p-6"
            >
              <h2 className="text-lg font-semibold text-foreground">
                {item.question}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.answer}
              </p>
            </motion.article>
          ))}
        </section>

        <section className="public-panel p-8 sm:p-16 border-t-8 border-primary bg-primary/5">
          <div className="relative z-10 flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex py-1 px-3 rounded-full bg-primary/10 text-primary font-sans text-[10px] font-black uppercase tracking-[0.2em]">
                Commercial review
              </div>
              <h2 className="font-display mt-8 text-5xl text-foreground sm:text-6xl uppercase tracking-tighter leading-[0.85]">
                If the workflow is real, we can price it clearly.
              </h2>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/company/contact"
                className="public-button px-10 py-5 text-sm"
              >
                Talk to sales
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/employees"
                className="public-button-secondary px-10 py-5 text-sm"
              >
                Compare employees
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
