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

const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

const fieldClassName =
  "w-full rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20";

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
    <div className="relative pb-32 pt-36 sm:pt-48 lg:pt-56 overflow-hidden bg-white">
      <div className="public-container relative z-10 space-y-12">
        {/* Hero */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.6 }}
          className="bg-zinc-50 border border-zinc-100 p-8 sm:p-12 lg:p-16 rounded-[2.5rem] relative overflow-hidden shadow-sm"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
          <div className="relative z-10 space-y-6">
            <div className="inline-flex py-1.5 px-4 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold tracking-wide text-blue-600 shadow-sm">
              Contact Nodebase
            </div>
            <h1 className="font-display max-w-4xl text-4xl leading-[1.1] text-zinc-950 sm:text-5xl lg:text-6xl tracking-tighter">
              Bring the workflow, the bottleneck, and the constraints.
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-zinc-600 font-sans">
              The fastest way to get a useful answer is to describe the operating
              lane you want the employee to own, the systems already in play, and
              where human approval still needs to remain.
            </p>
          </div>
        </motion.section>

        {/* Two-column: channels + form */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,1.1fr)]">
          <section className="space-y-6">
            {channels.map((channel, index) => {
              const Icon = channel.icon;
              const isExternal = channel.href.startsWith("mailto:");

              return (
                <motion.article
                  key={channel.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={reveal}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white border border-zinc-100 p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-500 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        {channel.title}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                        {channel.description}
                      </p>
                      {isExternal ? (
                        <a
                          href={channel.href}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {channel.cta}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <Link
                          href={channel.href}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
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

            <div className="bg-white border border-zinc-100 p-6 rounded-[2rem] shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 shadow-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Headquarters
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                    {COMPANY_CONFIG.headquarters.address}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact form */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-zinc-100 relative overflow-hidden shadow-lg"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
            <div className="relative z-10 space-y-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  Workflow intake
                </div>
                <h2 className="font-display mt-3 text-3xl text-zinc-950 tracking-tighter leading-tight">
                  Send enough signal that we can respond usefully.
                </h2>
              </div>

              <div className="grid gap-3">
                {prepNotes.map((note) => (
                  <div
                    key={note}
                    className="flex gap-3 rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-3 hover:bg-white transition-colors shadow-sm"
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <p className="text-sm text-zinc-600 italic font-medium">{note}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-zinc-900">
                    Name
                    <input
                      required
                      value={formState.name}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className={fieldClassName}
                      placeholder="Your name"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-zinc-900">
                    Email
                    <input
                      required
                      type="email"
                      value={formState.email}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className={fieldClassName}
                      placeholder="you@company.com"
                    />
                  </label>
                </div>

                <label className="block space-y-2 text-sm font-semibold text-zinc-900">
                  Company
                  <input
                    value={formState.company}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        company: event.target.value,
                      }))
                    }
                    className={fieldClassName}
                    placeholder="Company or team"
                  />
                </label>

                <label className="block space-y-2 text-sm font-semibold text-zinc-900">
                  Workflow summary
                  <textarea
                    required
                    value={formState.workflow}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        workflow: event.target.value,
                      }))
                    }
                    className={`${fieldClassName} min-h-[170px] resize-none`}
                    placeholder="Describe the workflow, channels, current bottleneck, and where human approval still matters."
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 text-white px-8 py-3 text-sm font-bold hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    Draft the email
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href="mailto:sales@nodebase.space"
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    sales@nodebase.space
                  </a>
                </div>

                {submitted ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-700 font-medium shadow-sm">
                    Your email client should open with the workflow draft. If it
                    does not, send the same details directly to
                    sales@nodebase.space.
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
