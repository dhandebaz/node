"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Infrastructure Deployment",
      desc: "Nodebase acquires and deploys high-performance compute hardware (GPUs, Storage servers) at our Okhla, Delhi facility."
    },
    {
      title: "Product Utilization",
      desc: "This infrastructure powers our core products: kaisa AI (for businesses) and Nodebase Space (cloud storage). Every chat and file upload uses this capacity."
    },
    {
      title: "Value Generation",
      desc: "Users pay for these services (SaaS subscriptions, API usage, Storage fees). This generates real-world revenue backed by utility."
    },
    {
      title: "Node Participation",
      desc: "Node holders, who funded the Phase 1 infrastructure, participate in the ecosystem's growth through a structured rewards model."
    }
  ];

  const processSteps = [
    {
      title: "Expression of Interest",
      content: "Submit your initial application via our secure portal. We review your background and alignment with Nodebase's mission to verify suitability for the network."
    },
    {
      title: "Eligibility Screening",
      content: "We conduct a preliminary check of your technical capability (if operating hardware) or financial standing (if capital partner) to ensure network stability."
    },
    {
      title: "KYC / AML Verification",
      content: "Standard identity verification and anti-money laundering checks to comply with Indian financial regulations and ensure a compliant ecosystem."
    },
    {
      title: "MoU Execution",
      content: "Signing of the Memorandum of Understanding outlining the terms of the partnership, expected returns, and operational responsibilities."
    },
    {
      title: "Capital Deployment",
      content: "Transfer of funds for hardware acquisition or direct deployment of your own hardware to our Okhla datacenter facility."
    },
    {
      title: "Deployment & Activation",
      content: "Our engineering team racks, stacks, and provisions the nodes. Your dashboard goes live and you begin seeing real-time network telemetry."
    },
    {
      title: "Periodic Reporting",
      content: "Receive monthly detailed reports on node uptime, compute usage, and revenue generation directly through your Nodebase dashboard."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone relative overflow-hidden font-sans selection:bg-brand-bone/20">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <NetworkBackground />
      </div>
      
      {/* SECTION 1: HERO */}
      <section className="min-h-screen flex flex-col justify-center px-6 pt-24 pb-12 relative border-b border-brand-bone/10 z-10">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeInUp}>
              <Link href="/node" className="text-sm font-bold uppercase tracking-widest border-b border-brand-bone/20 mb-12 inline-block hover:text-brand-bone/80 transition-colors">
                ← Back to Node
              </Link>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-12 text-brand-bone">
              The Model.
            </motion.h1>
            
            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-brand-bone/20 pt-8">
              <p className="text-xl md:text-2xl text-brand-bone/80 font-light leading-relaxed max-w-md">
                A closed-loop system where physical infrastructure drives digital value.
                Real hardware. Real customers. Real revenue.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: THE CYCLE */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-24 border-b border-brand-bone/10 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
           <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-16 text-brand-bone"
           >
            Ecosystem<br />Cycle.
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16">
            {steps.map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex flex-col gap-6"
              >
                <span className="text-xl font-bold opacity-50 border-b border-brand-bone/20 pb-2 w-fit text-brand-bone">
                  0{i + 1}
                </span>
                <h3 className="text-4xl font-bold uppercase tracking-tight leading-none text-brand-bone">
                  {step.title}
                </h3>
                <p className="text-lg text-brand-bone/80 leading-relaxed max-w-sm font-light">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: PROCESS */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-24 border-b border-brand-bone/10 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-16 text-brand-bone"
          >
            Execution<br />Process.
          </motion.h2>
          
          <div className="border-t border-brand-bone/20">
            {processSteps.map((step, i) => (
              <ProcessStep key={i} index={i} step={step} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA */}
       <section className="min-h-[50vh] flex flex-col justify-center px-6 py-24 relative z-10">
        <div className="max-w-7xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-12 text-brand-bone">
              Start<br />Process.
            </h2>
            
            <Link 
              href="/node/apply"
              className="inline-flex items-center gap-6 text-3xl md:text-5xl font-bold uppercase tracking-tighter border-b-4 border-brand-bone pb-2 hover:gap-8 transition-all text-brand-bone"
            >
              Apply Now <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

function ProcessStep({ step, index }: { step: { title: string; content: string }; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="border-b border-brand-bone/20"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group hover:bg-brand-bone/5 transition-colors px-4 -mx-4"
      >
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold opacity-50 w-12 text-brand-bone">0{index + 1}</span>
          <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-brand-bone">{step.title}</h3>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-8 h-8 opacity-50 text-brand-bone" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pl-20 pb-8 pr-4">
              <p className="text-xl text-brand-bone/80 leading-relaxed max-w-2xl font-light">
                {step.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
