"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Building2, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function SystemIntegratorsPage() {
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

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone relative overflow-hidden font-sans selection:bg-brand-bone/20">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <NetworkBackground />
      </div>

      <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-8 text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60">
              Partner Program
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8 text-brand-bone leading-[0.85]"
            >
              System<br/>Integrators
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-brand-bone/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Empower your enterprise clients with sovereign AI and cloud infrastructure.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-16 items-center mb-24 max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight text-brand-bone">Why Partner with Nodebase?</h2>
              <p className="text-lg text-brand-bone/70 mb-8 leading-relaxed">
                As a System Integrator, you are the trusted advisor to your clients. By partnering with Nodebase, 
                you can offer them the only sovereign cloud stack in India that is fully compliant with the DPDP Act 2023.
                Unlock new revenue streams by deploying kaisa AI agents and managing private cloud infrastructure.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Recurring revenue share on all managed compute",
                  "Priority access to H100 GPU clusters",
                  "Dedicated solution architect support",
                  "White-label kaisa AI capabilities"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand-bone shrink-0" />
                    <span className="text-brand-bone/80">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-6">
              <div className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
                <Users className="w-8 h-8 text-brand-bone mb-4" />
                <h3 className="text-xl font-bold mb-2 uppercase tracking-tight text-brand-bone">Consulting Services</h3>
                <p className="text-brand-bone/60 leading-relaxed">
                  Help clients migrate legacy workloads to a modern, sovereign cloud architecture.
                </p>
              </div>
              <div className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
                <Trophy className="w-8 h-8 text-brand-bone mb-4" />
                <h3 className="text-xl font-bold mb-2 uppercase tracking-tight text-brand-bone">Implementation</h3>
                <p className="text-brand-bone/60 leading-relaxed">
                  Deploy and configure kaisa AI agents for customer support, sales, and operations.
                </p>
              </div>
              <div className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
                <Building2 className="w-8 h-8 text-brand-bone mb-4" />
                <h3 className="text-xl font-bold mb-2 uppercase tracking-tight text-brand-bone">Managed Services</h3>
                <p className="text-brand-bone/60 leading-relaxed">
                  Provide 24/7 monitoring and management of client infrastructure on Nodebase.
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="p-12 rounded-3xl border border-brand-bone/10 bg-brand-bone/5 text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight text-brand-bone">Start Your Journey</h2>
            <p className="text-xl text-brand-bone/60 mb-8">
              Join the network of elite integrators shaping India's digital future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="mailto:partners@nodebase.in?subject=SI%20Partnership%20Application" 
                className="px-8 py-4 bg-brand-bone text-brand-deep-red font-bold rounded-full hover:bg-white transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm">
                Apply as Partner <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/docs/kaisa" 
                className="px-8 py-4 bg-transparent border border-brand-bone/20 text-brand-bone font-bold rounded-full hover:bg-brand-bone/10 transition-colors uppercase tracking-wider text-sm">
                Explore Solutions
              </Link>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
