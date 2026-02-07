"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, MessageSquare, Calendar, Database, Activity } from "lucide-react";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function EmployeesPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const managers = [
    {
      name: "Host AI",
      for: "For Airbnb & homestay owners",
      desc: "Handles guest conversations, availability updates, and booking follow-ups.",
      href: "/employees/host-ai"
    },
    {
      name: "Nurse AI",
      for: "For doctors, clinics, diagnostic centers",
      desc: "Manages patient messages, reminders, and intake follow-ups.",
      href: "/employees/nurse-ai"
    },
    {
      name: "Dukan AI",
      for: "For kirana & local retail stores",
      desc: "Answers customer questions, tracks orders, and confirms pickups.",
      href: "/employees/dukan-ai"
    },
    {
      name: "Thrift AI",
      for: "For thrift stores & resellers",
      desc: "Coordinates buyer inquiries, availability, and payment reminders.",
      href: "/employees/thrift-ai"
    },
    {
      name: "General Manager AI",
      for: "For freelancers & solo service providers",
      desc: "Keeps client intake, scheduling, and payment follow-ups organized.",
      href: "/employees/general-manager-ai"
    }
  ];

  const whatIs = [
    { title: "Handles customer conversations", icon: MessageSquare },
    { title: "Tracks follow-ups and status", icon: Activity },
    { title: "Works across channels", icon: Briefcase },
    { title: "Uses your business data as context", icon: Database },
    { title: "Runs continuously", icon: Calendar }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20">
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center items-center pt-32 md:pt-24 pb-16 px-6 overflow-hidden border-b border-brand-bone/10">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <NetworkBackground />
        </div>
        <div className="container mx-auto relative z-10 max-w-6xl text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="flex flex-col items-center"
          >
            <div className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-8 text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60">
              AI Employees
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-8 text-brand-bone">
              AI Managers for Solo Businesses
            </h1>
            <p className="text-xl md:text-2xl text-brand-silver mb-10 max-w-3xl font-light leading-relaxed">
              Hire role-specific AI employees that handle customers, operations, and follow-ups without tools or workflows.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#ai-managers"
                className="w-full sm:w-auto px-8 py-3 bg-brand-bone text-brand-deep-red rounded-lg font-bold uppercase tracking-wide hover:bg-white transition-all text-center flex items-center justify-center gap-2"
              >
                View AI Managers
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs/getting-started"
                className="w-full sm:w-auto px-8 py-3 border border-brand-bone/30 text-brand-bone rounded-lg font-bold uppercase tracking-wide hover:bg-brand-bone/10 transition-all text-center"
              >
                See how Nodebase works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 border-b border-brand-bone/10 bg-black/10">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-brand-bone">
              What is an AI Manager
            </h2>
            <p className="text-brand-bone/60 text-lg mt-4 max-w-3xl">
              A role-specific AI employee that runs daily operations using the same Nodebase Core across inbox, calendar, wallet, and integrations.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whatIs.map((item) => (
              <div key={item.title} className="p-6 rounded-2xl border border-brand-bone/10 bg-brand-bone/5">
                <item.icon className="w-6 h-6 text-brand-bone/70 mb-4" />
                <p className="text-brand-bone/80 font-medium">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ai-managers" className="py-16 md:py-24 px-6 border-b border-brand-bone/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold uppercase leading-none text-brand-bone">
                AI Managers
              </h2>
              <p className="text-brand-bone/60 mt-3 max-w-2xl">
                Each manager uses the same system. The difference is context, workflows, and UI emphasis.
              </p>
            </div>
          </div>
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {managers.map((role) => (
              <motion.div
                key={role.name}
                variants={fadeInUp}
                className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors flex flex-col h-full"
              >
                <div className="text-xs font-mono uppercase tracking-widest text-brand-bone/60 mb-3">
                  {role.for}
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-3 text-brand-bone">
                  {role.name}
                </h3>
                <p className="text-brand-bone/60 mb-8 flex-grow">{role.desc}</p>
                <Link
                  href={role.href}
                  className="w-full py-3 border border-brand-bone/30 text-brand-bone rounded-lg font-bold uppercase tracking-wide hover:bg-brand-bone/10 transition-all text-center flex items-center justify-center gap-2"
                >
                  View details
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
