"use client";

import { motion } from "framer-motion";
import { Briefcase, Code2, Server, BrainCircuit, ArrowRight } from "lucide-react";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function CareersPage() {
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
              Careers
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8 text-brand-bone leading-[0.85]"
            >
              Join the<br/>Mission
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-brand-bone/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              We are looking for engineers, researchers, and builders who want to shape India's digital future.
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
            className="max-w-4xl mx-auto space-y-8"
          >
            
            <motion.div variants={fadeInUp} className="p-8 rounded-2xl border-l-4 border-l-brand-bone border-y border-r border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-brand-bone group-hover:text-brand-bone transition-colors">Senior Frontend Engineer</h3>
                  <p className="text-brand-bone/60 text-sm mt-1">Engineering • Delhi • Remote Hybrid</p>
                </div>
                <Code2 className="w-6 h-6 text-brand-bone opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-brand-bone/70 mb-6 leading-relaxed">
                Build the next generation of cloud interfaces. Work with React, Next.js, and WebGL to create immersive, high-performance dashboards for our users.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-bone">
                Apply Now <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-8 rounded-2xl border-l-4 border-l-brand-bone border-y border-r border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-brand-bone group-hover:text-brand-bone transition-colors">AI Research Scientist</h3>
                  <p className="text-brand-bone/60 text-sm mt-1">Research • Delhi • On-site</p>
                </div>
                <BrainCircuit className="w-6 h-6 text-brand-bone opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-brand-bone/70 mb-6 leading-relaxed">
                Advance the state of Indic LLMs. Work on fine-tuning, tokenization strategies for Indian languages, and optimizing inference on H100 clusters.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-bone">
                Apply Now <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-8 rounded-2xl border-l-4 border-l-brand-bone border-y border-r border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-brand-bone group-hover:text-brand-bone transition-colors">Infrastructure Operations Lead</h3>
                  <p className="text-brand-bone/60 text-sm mt-1">Ops • Delhi • On-site</p>
                </div>
                <Server className="w-6 h-6 text-brand-bone opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-brand-bone/70 mb-6 leading-relaxed">
                Manage our physical data center footprint. Oversee server deployment, network architecture, and ensure 99.99% uptime for our sovereign cloud.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-bone">
                Apply Now <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>
    </div>
  );
}
