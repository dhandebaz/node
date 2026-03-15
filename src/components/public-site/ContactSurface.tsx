"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Mail,
  MapPin,
  MessageSquareShare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { COMPANY_CONFIG } from "@/lib/config/company";

const channels: {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Workflow review",
    description:
      "Best for businesses that want to map one workflow, one employee, and the controls needed before launch.",
    href: "mailto:sales@nodebase.space?subject=Workflow%20Review%20for%20Nodebase",
    cta: "sales@nodebase.space",
    icon: MessageSquareShare,
  },
  {
    title: "Partnerships",
    description:
      "For system integrators, rollout operators, and technology partners evaluating a structured motion with Nodebase.",
    href: "mailto:sales@nodebase.space?subject=Nodebase%20Partnership%20Inquiry",
    cta: "Partnership desk",
    icon: Building2,
  },
  {
    title: "Trust and policy",
    description:
      "Use this lane when the workflow is sensitive and you need clarity on trust posture, risk boundaries, or legal terms.",
    href: "/trust",
    cta: "Review trust center",
    icon: ShieldCheck,
  },
];

const prepNotes = [
  "What workflow do you want the employee to own?",
  "Which channels and systems are already in use?",
  "Where does human approval still need to stay in the loop?",
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const fieldClassName =
  "w-full rounded-[1.2rem] border border-[var(--public-line)] bg-[rgba(255,251,244,0.92)] px-4 py-3 text-sm text-[var(--public-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] outline-none transition focus:border-[rgba(146,43,34,0.42)] focus:ring-4 focus:ring-[rgba(214,88,74,0.12)]";

export function ContactSurface() {
  const [formState, setFormState] = useState({
    company: "",
    email: "",
    name: "",
    workflow: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = formState.company
      ? `Nodebase workflow review for ${formState.company}`
      : "Nodebase workflow review";
    const body = [
      `Name: ${formState.name || "-"}`,
      `Email: ${formState.email || "-"}`,
      `Company: ${formState.company || "-"}`,
      "",
      "Workflow details:",
      formState.workflow || "-",
    ].join("\n");

    window.location.href = `mailto:sales@nodebase.space?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  return (
    <div className="pb-20 pt-28 sm:pt-32 lg:pt-36">
      <div className="public-container space-y-6">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="public-panel px-6 py-8 sm:px-8 sm:py-10 lg:px-10"
        >
          <div className="relative z-10 space-y-6">
            <div className="public-pill public-eyebrow">Contact Nodebase</div>
            <h1 className="public-display max-w-4xl text-4xl leading-[0.92] text-[var(--public-ink)] sm:text-5xl lg:text-6xl">
              Bring the workflow, the bottleneck, and the constraints.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-[var(--public-muted)] sm:text-lg">
              The fastest way to get a useful answer is to describe the operating lane
              you want the employee to own, the systems already in play, and where human
              approval still needs to remain.
            </p>
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,1.1fr)]">
          <section className="space-y-4">
            {channels.map((channel, index) => {
              const Icon = channel.icon;
              const isExternal = channel.href.startsWith("mailto:");

              return (
                <motion.article
                  key={channel.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={fadeUp}
                  transition={{ duration: 0.42, delay: index * 0.08 }}
                  className="public-panel-soft p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="public-eyebrow">{channel.title}</div>
                      <p className="mt-3 text-sm leading-6 text-[var(--public-muted)]">
                        {channel.description}
                      </p>
                      {isExternal ? (
                        <a
                          href={channel.href}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-accent-strong)]"
                        >
                          {channel.cta}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <Link
                          href={channel.href}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-accent-strong)]"
                        >
                          {channel.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}

            <div className="public-panel-soft p-6">
              <div className="flex items-start gap-3">
                <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="public-eyebrow">Headquarters</div>
                  <p className="mt-3 text-sm leading-6 text-[var(--public-muted)]">
                    {COMPANY_CONFIG.headquarters.address}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.46 }}
            className="public-panel p-6 sm:p-8"
          >
            <div className="relative z-10 space-y-6">
              <div>
                <div className="public-eyebrow">Workflow intake</div>
                <h2 className="public-display mt-3 text-3xl text-[var(--public-ink)] sm:text-4xl">
                  Send enough signal that we can respond usefully.
                </h2>
              </div>

              <div className="grid gap-3">
                {prepNotes.map((note) => (
                  <div key={note} className="public-inset flex gap-3 rounded-[1.4rem] px-4 py-4">
                    <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[var(--public-accent-strong)]" />
                    <p className="text-sm leading-6 text-[var(--public-muted)]">{note}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-[var(--public-ink)]">
                    Name
                    <input
                      required
                      value={formState.name}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, name: event.target.value }))
                      }
                      className={fieldClassName}
                      placeholder="Your name"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-[var(--public-ink)]">
                    Email
                    <input
                      required
                      type="email"
                      value={formState.email}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, email: event.target.value }))
                      }
                      className={fieldClassName}
                      placeholder="you@company.com"
                    />
                  </label>
                </div>

                <label className="block space-y-2 text-sm font-semibold text-[var(--public-ink)]">
                  Company
                  <input
                    value={formState.company}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, company: event.target.value }))
                    }
                    className={fieldClassName}
                    placeholder="Company or team"
                  />
                </label>

                <label className="block space-y-2 text-sm font-semibold text-[var(--public-ink)]">
                  Workflow summary
                  <textarea
                    required
                    value={formState.workflow}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, workflow: event.target.value }))
                    }
                    className={`${fieldClassName} min-h-[170px] resize-none`}
                    placeholder="Describe the workflow, channels, current bottleneck, and where human approval still matters."
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button type="submit" className="public-button px-6 py-3 text-sm font-semibold">
                    Draft the email
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href="mailto:sales@nodebase.space"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-accent-strong)]"
                  >
                    <Mail className="h-4 w-4" />
                    sales@nodebase.space
                  </a>
                </div>

                {submitted ? (
                  <div className="rounded-[1.4rem] border border-[var(--public-line)] bg-[var(--public-accent-soft)]/65 px-4 py-3 text-sm leading-6 text-[var(--public-ink)]">
                    Your email client should open with the workflow draft. If it does not,
                    send the same details directly to sales@nodebase.space.
                  </div>
                ) : null}
              </form>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
