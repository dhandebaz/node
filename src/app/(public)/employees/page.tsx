"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, MessageSquare, Calendar, Database, Activity } from "lucide-react";

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
      href: "/employees/host-ai",
      icon: "🏠"
    },
    {
      name: "Nurse AI",
      for: "For doctors, clinics, diagnostic centers",
      desc: "Manages patient messages, reminders, and intake follow-ups.",
      href: "/employees/nurse-ai",
      icon: "🩺"
    },
    {
      name: "Dukan AI",
      for: "For kirana & local retail stores",
      desc: "Answers customer questions, tracks orders, and confirms pickups.",
      href: "/employees/dukan-ai",
      icon: "🛍️"
    },
    {
      name: "Thrift AI",
      for: "For thrift stores & resellers",
      desc: "Coordinates buyer inquiries, availability, and payment reminders.",
      href: "/employees/thrift-ai",
      icon: "👗"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone relative overflow-hidden font-sans selection:bg-brand-bone/20 bg-grid-pattern">
      
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative z-10">
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
              Your New<br/>Workforce
            </h1>
            <p className="text-xl md:text-2xl text-brand-silver mb-10 max-w-3xl font-light leading-relaxed">
              Hire role-specific AI employees that handle customers, operations, and follow-ups without tools or workflows.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="ai-managers" className="py-24 px-6 border-t border-brand-bone/10 bg-brand-deep-red/95 backdrop-blur-sm relative z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {managers.map((manager, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="group p-8 rounded-3xl border border-brand-bone/20 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="h-14 w-14 bg-brand-bone/10 rounded-full flex items-center justify-center text-3xl">
                    {manager.icon}
                  </div>
                  <Link href={manager.href} className="p-2 rounded-full border border-brand-bone/20 text-brand-bone/60 group-hover:bg-brand-bone group-hover:text-brand-deep-red transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">{manager.name}</h3>
                <p className="text-sm font-bold text-brand-bone/40 uppercase tracking-wider mb-4">{manager.for}</p>
                <p className="text-lg opacity-80 leading-relaxed">
                  {manager.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
