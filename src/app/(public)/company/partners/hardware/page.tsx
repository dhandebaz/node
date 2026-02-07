"use client";

import { motion } from "framer-motion";
import { Server, Cpu, ShieldCheck, ArrowRight, HardDrive } from "lucide-react";
import Link from "next/link";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function HardwarePartnersPage() {
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
              Hardware<br/>Certification
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-brand-bone/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Validate your servers and components for the Nodebase sovereign cloud.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-6 text-center text-brand-bone">Powering the Next-Gen Cloud</h2>
            <p className="text-xl text-brand-bone/70 text-center mb-12 font-light">
              Nodebase runs on bare metal. We partner with leading OEMs to certify 
              high-performance computing hardware, storage arrays, and networking equipment 
              for our data centers in India.
            </p>

            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
               {[
                 { icon: Server, title: "Server Platforms", desc: "x86 and ARM-based rack servers optimized for density and thermal efficiency." },
                 { icon: Cpu, title: "Accelerators", desc: "GPUs, TPUs, and FPGAs for AI training and inference workloads." },
                 { icon: HardDrive, title: "Storage Components", desc: "Enterprise-grade NVMe SSDs and high-capacity HDDs for object storage." },
                 { icon: ShieldCheck, title: "Security Modules", desc: "HSMs and TPMs ensuring root-of-trust and encryption compliance." }
               ].map((item, i) => (
                 <motion.div key={i} variants={fadeInUp} className="bg-brand-bone/5 border border-brand-bone/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-brand-bone/10 transition-colors">
                   <item.icon className="w-8 h-8 text-brand-bone shrink-0" />
                   <div>
                     <h3 className="text-lg font-bold uppercase tracking-tight text-brand-bone mb-2">{item.title}</h3>
                     <p className="text-brand-bone/60 text-sm">
                       {item.desc}
                     </p>
                   </div>
                 </motion.div>
               ))}
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl p-12 text-center max-w-4xl mx-auto border border-brand-bone/10 bg-brand-bone/5"
          >
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-6 text-brand-bone">Certification Process</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12 text-left">
              {[
                { id: "01", title: "Submission", desc: "Submit hardware specs and samples to our Okhla lab." },
                { id: "02", title: "Validation", desc: "We run automated stress tests and kernel compatibility checks." },
                { id: "03", title: "Listing", desc: "Certified hardware is listed on our HCL and procurement portal." }
              ].map((step, i) => (
                <div key={i}>
                  <div className="text-brand-bone/40 font-mono text-xl mb-2">{step.id}</div>
                  <h4 className="font-bold uppercase tracking-tight text-brand-bone mb-2">{step.title}</h4>
                  <p className="text-sm text-brand-bone/60">{step.desc}</p>
                </div>
              ))}
            </div>

            <Link href="mailto:partners@nodebase.in?subject=Hardware%20Certification" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-bone text-brand-deep-red font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-colors">
              Certify Hardware <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
