"use client";

import { motion } from "framer-motion";
import { Server, Cpu, Wifi, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function NodeInfrastructurePage() {
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

  const specs = [
    {
      title: "Compute Nodes",
      desc: "NVIDIA H100 & A100 Tensor Core GPUs for AI training and inference workloads.",
      icon: Cpu,
      details: ["80GB HBM3 Memory", "900GB/s Bandwidth", "NVLink Interconnect"]
    },
    {
      title: "Storage Cluster",
      desc: "High-performance NVMe storage arrays with triple replication for data durability.",
      icon: Server,
      details: ["100TB+ NVMe Pools", "Ceph Object Storage", "10Gbps Write Speed"]
    },
    {
      title: "Network Fabric",
      desc: "Low-latency switching fabric connected directly to major Indian ISPs (NIXI).",
      icon: Wifi,
      details: ["400Gbps Backbone", "<20ms India Latency", "DDoS Protection"]
    },
    {
      title: "Physical Security",
      desc: "Tier-IV data center facility with biometric access control and 24/7 surveillance.",
      icon: ShieldCheck,
      details: ["Biometric Entry", "Noc Monitoring", "ISO 27001 Certified"]
    }
  ];

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
              Infrastructure
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8 text-brand-bone leading-[0.85]"
            >
              The<br/>Hardware
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-brand-bone/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Real assets. Real performance. Located in Okhla, New Delhi.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {specs.map((spec, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-3xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors group"
              >
                <div className="w-16 h-16 bg-brand-bone/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <spec.icon className="w-8 h-8 text-brand-bone" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 text-brand-bone">{spec.title}</h3>
                <p className="text-brand-bone/70 mb-8 leading-relaxed text-lg">
                  {spec.desc}
                </p>
                <ul className="space-y-3 border-t border-brand-bone/10 pt-6">
                  {spec.details.map((detail, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-mono text-brand-bone/60 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-brand-bone/40 rounded-full" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 text-center"
          >
             <Link href="/node/apply" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-bone text-brand-deep-red font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-colors">
               Apply for Allocation <ArrowRight className="w-5 h-5" />
             </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
