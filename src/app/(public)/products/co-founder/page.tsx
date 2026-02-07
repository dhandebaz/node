"use client";

import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Target, Globe, Zap, ShieldCheck } from "lucide-react";

export default function CoFounderPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const features = [
    {
      title: "Strategic Autonomy",
      desc: "Makes high-level decisions, manages budgets, and optimizes resource allocation independently.",
      icon: Target
    },
    {
      title: "Global Operations",
      desc: "Manages multiple departments, international compliance, and cross-border logistics.",
      icon: Globe
    },
    {
      title: "Rapid Execution",
      desc: "Implements strategies instantly across your entire organization without communication lag.",
      icon: Zap
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone selection:bg-brand-bone/20 overflow-x-hidden font-sans">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-40">
          <NetworkBackground />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="flex justify-center mb-8">
              <span className="px-4 py-1.5 rounded-full border border-brand-bone/10 bg-brand-bone/5 text-xs font-mono tracking-widest text-brand-bone/60 uppercase">
                Product / AI Employee
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-brand-bone leading-[1.1] mb-6"
            >
              Co-Founder
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl sm:text-2xl text-brand-silver mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Autonomous execution for serious businesses.
              Full autopilot for strategy, operations, and scale.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link 
                href="/login?plan=cofounder" 
                className="w-full sm:w-auto px-8 py-4 bg-brand-bone text-brand-deep-red rounded-full font-medium transition-all hover:bg-white hover:scale-[0.98] active:scale-[0.96] flex items-center justify-center gap-2"
              >
                <span>Hire Co-Founder</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-32 border-t border-brand-bone/5 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-brand-bone/5 flex items-center justify-center border border-brand-bone/10 mb-6">
                  <feature.icon className="w-6 h-6 text-brand-cyan/80" />
                </div>
                <h3 className="text-2xl font-bold text-brand-bone">{feature.title}</h3>
                <p className="text-brand-silver leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ENTERPRISE SECURITY */}
      <section className="py-20 border-t border-brand-bone/5">
         <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8 border border-brand-bone/10 rounded-2xl bg-brand-bone/[0.02]">
               <ShieldCheck className="w-12 h-12 text-brand-bone/40" />
               <div>
                  <h3 className="text-xl font-bold text-brand-bone mb-2">Enterprise-Grade Security</h3>
                  <p className="text-brand-silver">The Co-Founder node operates in a dedicated, isolated environment with enhanced encryption and audit logging.</p>
               </div>
            </div>
         </div>
      </section>

      {/* POWERED BY CORE */}
      <section className="py-32 border-t border-brand-bone/5 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <BrainCircuit className="w-16 h-16 text-brand-bone/20 mx-auto mb-8" />
            <h2 className="text-3xl md:text-4xl font-bold text-brand-bone mb-6">
              Powered by Nodebase Core
            </h2>
            <p className="text-brand-silver mb-8">
              The Co-Founder has privileged access to the full capabilities of Nodebase Core, allowing for complex reasoning and multi-step execution.
            </p>
            <span className="text-xs font-mono text-brand-bone/40 uppercase tracking-widest">
              System Version 2.0.4
            </span>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
