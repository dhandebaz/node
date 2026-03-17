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
  { label: "Setup time", value: "Ready in 5 minutes" },
  { label: "Full control", value: "Jump in to chat anytime" },
  { label: "Zero commissions", value: "You keep 100% of your sales" },
];

const workflowPillars: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "The perfect AI for your business",
    description:
      "Whether you run a homestay, clinic, or store, Kaisa AI knows exactly how to talk to your customers.",
    icon: Sparkles,
  },
  {
    title: "Everything in one simple inbox",
    description:
      "Messages, bookings, and payments from WhatsApp and Instagram all flow into one easy-to-use dashboard.",
    icon: Waypoints,
  },
  {
    title: "You are always in charge",
    description:
      "Kaisa handles the busywork, but you can pause the AI and reply manually whenever a human touch is needed.",
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
    eyebrow: "Simple Dashboard",
    title: "Manage everything from your phone or laptop",
    body: "See all your unread messages, confirm bookings, and track your revenue without needing separate tools.",
    icon: Activity,
  },
  {
    eyebrow: "Automated Payments",
    title: "Collect payments directly in chat",
    body: "Kaisa automatically generates secure payment links and follows up with guests so you never chase a deposit again.",
    icon: CreditCard,
  },
  {
    eyebrow: "Works out of the box",
    title: "No coding or prompt engineering required",
    body: "Just fill in your property or store details, and Kaisa instantly knows how to handle common customer requests.",
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
            className="public-panel overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10"
          >
            <div className="absolute right-[-5rem] top-[-3rem] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(214,88,74,0.25),transparent_68%)]" />
            <div className="absolute bottom-[-6rem] left-[-5rem] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.45),transparent_72%)]" />
            <div className="relative z-10 space-y-8">
              <div className="space-y-5">
                <div className="public-pill public-eyebrow">
                  The AI assistant for local businesses
                </div>
                <h1 className="public-display max-w-4xl text-4xl leading-[0.92] text-[var(--public-ink)] sm:text-5xl lg:text-7xl">
                  The smart assistant that runs your business while you sleep.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-[var(--public-muted)] sm:text-lg">
                  Nodebase connects to your WhatsApp and website to instantly
                  answer customer questions, schedule bookings, and collect
                  payments automatically—24 hours a day, 7 days a week.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="public-button px-6 py-3 text-sm font-semibold"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/company/contact"
                  className="public-button-secondary px-6 py-3 text-sm font-semibold"
                >
                  Talk to Sales
                </Link>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="public-inset p-4">
                    <div className="public-eyebrow">{metric.label}</div>
                    <div className="mt-2 text-base font-semibold text-[var(--public-ink)]">
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
              className="public-panel p-5 sm:p-6"
            >
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="public-eyebrow">Unified Inbox</div>
                    <h2 className="public-display mt-2 text-2xl text-[var(--public-ink)]">
                      Everything your business needs in one place
                    </h2>
                  </div>
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4.8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="public-inset flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]"
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <div className="public-inset flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-[var(--public-ink)]">
                        Homestay Booking
                      </div>
                      <div className="text-xs text-[var(--public-muted)]">
                        Kaisa answered a question about parking and sent a
                        booking link.
                      </div>
                    </div>
                    <span className="public-pill text-xs font-semibold text-[var(--public-muted)]">
                      Payment Pending
                    </span>
                  </div>
                  <div className="public-inset flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-[var(--public-ink)]">
                        Clinic Appointment
                      </div>
                      <div className="text-xs text-[var(--public-muted)]">
                        Patient asked a complex question. AI paused for your
                        review.
                      </div>
                    </div>
                    <span className="public-pill text-xs font-semibold text-red-500 bg-red-500/10">
                      Needs Attention
                    </span>
                  </div>
                  <div className="public-inset flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-[var(--public-ink)]">
                        Store Order
                      </div>
                      <div className="text-xs text-[var(--public-muted)]">
                        Payment received. Customer confirmed delivery address.
                      </div>
                    </div>
                    <span className="public-pill text-xs font-semibold text-emerald-600 bg-emerald-500/10">
                      Paid
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[var(--public-line)] bg-[var(--public-accent-soft)]/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--public-ink)]">
                    <Clock3 className="h-4 w-4 text-[var(--public-accent-strong)]" />
                    Never lose a sale because you replied too late. Kaisa
                    answers instantly.
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
                    className="public-panel-soft p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="public-eyebrow">{card.eyebrow}</div>
                        <h3 className="mt-2 text-lg font-semibold text-[var(--public-ink)]">
                          {card.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">
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
                className="public-panel-soft p-6"
              >
                <div className="public-inset flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-[var(--public-ink)]">
                  {pillar.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--public-muted)]">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </section>

        <section className="public-panel p-6 sm:p-8 lg:p-10">
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="public-pill public-eyebrow">
                  Choose the employee
                </div>
                <h2 className="public-display mt-4 text-3xl text-[var(--public-ink)] sm:text-4xl">
                  Hire by business lane, not by general-purpose model
                  capability.
                </h2>
              </div>
              <Link
                href="/pricing"
                className="public-button-secondary px-5 py-3 text-sm font-semibold"
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
                      <div className="public-panel-soft group h-full p-5 transition-transform duration-200 hover:-translate-y-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/75 text-[var(--public-accent-strong)]">
                            {Icon ? <Icon className="h-5 w-5" /> : null}
                          </div>
                          {item.stat ? (
                            <span className="public-pill text-xs font-semibold text-[var(--public-muted)]">
                              {item.stat}
                            </span>
                          ) : null}
                        </div>
                        <div className="public-eyebrow mt-5">
                          {item.eyebrow}
                        </div>
                        <h3 className="mt-2 text-xl font-semibold text-[var(--public-ink)]">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[var(--public-muted)]">
                          {item.description}
                        </p>
                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-accent-strong)]">
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
          <section className="public-panel-soft p-6 sm:p-8">
            <div className="space-y-5">
              <div className="public-pill public-eyebrow">Rollout posture</div>
              <h2 className="public-display text-3xl text-[var(--public-ink)] sm:text-4xl">
                Upgrade the workflow, then the page surface.
              </h2>
              <p className="text-base leading-7 text-[var(--public-muted)]">
                The public site now reflects a higher signal product: role-based
                employees, documented controls, stronger legal surfaces, and
                clearer deployment logic.
              </p>
              <div className="grid gap-3">
                <Link
                  href="/trust"
                  className="public-inset flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--public-ink)]"
                >
                  Trust center
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/docs"
                  className="public-inset flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--public-ink)]"
                >
                  Documentation
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/company"
                  className="public-inset flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--public-ink)]"
                >
                  Company and partner model
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="public-panel p-6 sm:p-8">
            <div className="relative z-10 space-y-6">
              <div>
                <div className="public-eyebrow">Practical launch sequence</div>
                <h2 className="public-display mt-3 text-3xl text-[var(--public-ink)]">
                  Ship the employee with the operating model attached.
                </h2>
              </div>
              <div className="space-y-4">
                {operatingSequence.map((step, index) => (
                  <div
                    key={step}
                    className="public-inset flex gap-4 rounded-[1.4rem] px-4 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--public-accent)] text-sm font-bold text-white">
                      0{index + 1}
                    </div>
                    <p className="text-sm leading-6 text-[var(--public-muted)] sm:text-base">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="public-panel public-shimmer p-6 sm:p-8 lg:p-10">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="public-pill public-eyebrow">Ready to deploy</div>
              <h2 className="public-display mt-4 text-3xl text-[var(--public-ink)] sm:text-4xl">
                If the workflow matters, launch it with the right employee and
                the right controls.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/company/contact"
                className="public-button px-6 py-3 text-sm font-semibold"
              >
                Talk to Nodebase
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/employees"
                className="public-button-secondary px-6 py-3 text-sm font-semibold"
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
