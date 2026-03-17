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
        "p-6 sm:p-7",
        frame.featured ? "public-panel" : "public-panel-soft",
      )}
    >
      <div className="relative z-10 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
            <Icon className="h-5 w-5" />
          </div>
          <span className="public-pill text-xs font-semibold text-[var(--public-muted)]">
            {frame.eyebrow}
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-[var(--public-ink)]">
            {frame.title}
          </h2>
          <div className="mt-2 text-2xl font-semibold text-[var(--public-accent-strong)]">
            {frame.price}
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--public-muted)]">
            {frame.description}
          </p>
        </div>
        <ul className="space-y-3">
          {frame.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex gap-3 text-sm leading-6 text-[var(--public-muted)]"
            >
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--public-accent-strong)]" />
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
            className="public-panel px-6 py-8 sm:px-8 sm:py-10 lg:px-10"
          >
            <div className="relative z-10 space-y-6">
              <div className="public-pill public-eyebrow">Pricing</div>
              <h1 className="public-display max-w-4xl text-4xl leading-[0.92] text-[var(--public-ink)] sm:text-5xl lg:text-6xl">
                Price the workflow operating system, not the hype layer around
                it.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-[var(--public-muted)] sm:text-lg">
                Nodebase pricing is structured around the platform retainer,
                real usage, and rollout help where the workflow deserves it. The
                goal is practical economics with visible controls.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/company/contact"
                  className="public-button px-6 py-3 text-sm font-semibold"
                >
                  Scope a deployment
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/docs/getting-started/quickstart"
                  className="public-button-secondary px-6 py-3 text-sm font-semibold"
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
            className="public-panel-soft p-6 sm:p-7"
          >
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="public-eyebrow">Commercial posture</div>
                  <h2 className="text-xl font-semibold text-[var(--public-ink)]">
                    Built for operators who care about unit economics
                  </h2>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="public-inset rounded-[1.4rem] px-4 py-4">
                  <div className="public-eyebrow">Base</div>
                  <div className="mt-2 text-lg font-semibold text-[var(--public-ink)]">
                    Subscription plus usage
                  </div>
                </div>
                <div className="public-inset rounded-[1.4rem] px-4 py-4">
                  <div className="public-eyebrow">Revenue model</div>
                  <div className="mt-2 text-lg font-semibold text-[var(--public-ink)]">
                    No commission on sales or bookings
                  </div>
                </div>
                <div className="public-inset rounded-[1.4rem] px-4 py-4">
                  <div className="public-eyebrow">Operator control</div>
                  <div className="mt-2 text-lg font-semibold text-[var(--public-ink)]">
                    Budget thresholds and approvals stay configurable
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
          <section className="public-panel-soft p-6 sm:p-8">
            <div className="space-y-5">
              <div className="public-pill public-eyebrow">
                How to think about spend
              </div>
              <h2 className="public-display text-3xl text-[var(--public-ink)] sm:text-4xl">
                The real comparison is against manual drift and missed
                follow-through.
              </h2>
              <div className="space-y-3">
                {operatingRules.map((rule) => (
                  <div
                    key={rule}
                    className="public-inset flex gap-3 rounded-[1.4rem] px-4 py-4"
                  >
                    <Activity className="mt-1 h-4 w-4 shrink-0 text-[var(--public-accent-strong)]" />
                    <p className="text-sm leading-6 text-[var(--public-muted)]">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="public-panel p-6 sm:p-8">
            <div className="relative z-10 space-y-5">
              <div className="public-eyebrow">Example monthly frame</div>
              <h2 className="public-display text-3xl text-[var(--public-ink)]">
                A simple ledger, not a pricing maze.
              </h2>
              <div className="space-y-3">
                {sampleLedger.map((entry) => (
                  <div
                    key={entry.label}
                    className="public-inset flex items-center justify-between gap-4 rounded-[1.4rem] px-4 py-4"
                  >
                    <div className="text-sm font-semibold text-[var(--public-ink)]">
                      {entry.label}
                    </div>
                    <div className="text-sm text-[var(--public-muted)]">
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
              <h2 className="text-lg font-semibold text-[var(--public-ink)]">
                {item.question}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--public-muted)]">
                {item.answer}
              </p>
            </motion.article>
          ))}
        </section>

        <section className="public-panel public-shimmer p-6 sm:p-8 lg:p-10">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="public-pill public-eyebrow">
                Commercial review
              </div>
              <h2 className="public-display mt-4 text-3xl text-[var(--public-ink)] sm:text-4xl">
                If the workflow is real, we can price it clearly.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/company/contact"
                className="public-button px-6 py-3 text-sm font-semibold"
              >
                Talk to sales
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/employees"
                className="public-button-secondary px-6 py-3 text-sm font-semibold"
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
