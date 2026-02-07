"use client";

import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { Box, Cloud, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SharedPage() {
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
              Space / Compute
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8 text-brand-bone leading-[0.85]"
            >
              Shared Cloud<br/>Virtual Machines
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-brand-bone/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Instant, scalable compute instances powered by NVMe storage.
              Deploy in seconds, pay by the hour.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link 
                href="/login?product=vps" 
                className="px-8 py-4 bg-brand-bone text-brand-deep-red rounded-full font-bold uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2"
              >
                Deploy Instance <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative z-10 bg-black/20 backdrop-blur-sm border-t border-brand-bone/5">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5">
              <Box className="w-10 h-10 text-brand-bone mb-6" />
              <h3 className="text-xl font-bold mb-3 uppercase tracking-tight text-brand-bone">Instant Provisioning</h3>
              <p className="text-brand-bone/60 leading-relaxed">
                Spin up Linux or Windows instances in under 30 seconds. API-driven control for automated scaling.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5">
              <Cloud className="w-10 h-10 text-brand-bone mb-6" />
              <h3 className="text-xl font-bold mb-3 uppercase tracking-tight text-brand-bone">NVMe Storage</h3>
              <p className="text-brand-bone/60 leading-relaxed">
                All instances are backed by enterprise-grade NVMe SSDs, delivering 100k+ IOPS for database workloads.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5">
              <Lock className="w-10 h-10 text-brand-bone mb-6" />
              <h3 className="text-xl font-bold mb-3 uppercase tracking-tight text-brand-bone">VPC Isolation</h3>
              <p className="text-brand-bone/60 leading-relaxed">
                Instances run within a Virtual Private Cloud (VPC), completely isolated from other tenants at Layer 2.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
