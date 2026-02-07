
"use client";

import Link from "next/link";
import { ArrowRight, Check, Cloud, Database, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function SpacePage() {
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
      
      {/* SECTION 1: HERO */}
      <section className="min-h-screen flex flex-col justify-center px-6 pt-32 pb-12 relative z-10 border-b border-brand-bone/10">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeInUp}>
              <Link href="/node" className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-12 text-sm font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60 hover:bg-brand-bone/10 transition-colors">
                ← Back to Node
              </Link>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-12 text-brand-bone">
              Nodebase<br />
              Space.
            </motion.h1>
            
            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-brand-bone/20 pt-8">
              <p className="text-xl md:text-2xl text-brand-bone/80 font-light leading-relaxed max-w-md">
                Sovereign cloud object storage and compute. 
                Built on our own hardware in Okhla, Delhi.
                No egress fees for India-to-India traffic.
              </p>
              <div className="flex flex-col items-start justify-end">
                <div className="text-xl font-bold uppercase tracking-widest text-brand-bone">
                  Region: ap-south-1 (Delhi)
                </div>
                <div className="text-sm opacity-60 uppercase tracking-widest mt-2 text-brand-bone">
                  Status: Public Beta
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: SPECS GRID */}
      <section className="min-h-[50vh] flex flex-col justify-center px-6 py-24 border-b border-brand-bone/10 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
           <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-16 text-brand-bone"
           >
            Performance.
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { value: "99.99%", label: "Uptime SLA", icon: Cloud },
              { value: "<20ms", label: "Pan-India Latency", icon: Globe },
              { value: "NVMe", label: "Gen 4.0 Storage", icon: Database }
            ].map((spec, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border-l border-brand-bone/20 pl-6"
              >
                <div className="text-6xl md:text-8xl font-bold tracking-tighter mb-2 text-brand-bone">
                  {spec.value}
                </div>
                <div className="text-sm font-bold uppercase tracking-widest opacity-60 text-brand-bone">
                  {spec.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: PRICING BOX */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-24 border-b border-brand-bone/10 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-16 text-brand-bone"
          >
            Simple<br />Pricing.
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="border border-brand-bone/20 p-8 md:p-16 relative overflow-hidden group bg-brand-bone/5 hover:bg-brand-bone hover:text-brand-deep-red transition-colors duration-500 rounded-3xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div>
                <h3 className="text-3xl font-bold uppercase tracking-tight mb-2">Web Hosting</h3>
                <p className="opacity-80 mb-8 text-lg">Deploy static sites and frontend applications globally.</p>
                
                <div className="flex items-baseline gap-2 mb-8 flex-wrap">
                   <span className="text-5xl md:text-8xl font-bold tracking-tighter">$0</span>
                   <span className="text-lg md:text-xl font-bold uppercase tracking-widest opacity-60">/ Month</span>
                </div>

                <ul className="space-y-4">
                  {[
                    "Unlimited Bandwidth",
                    "Free SSL Certificates",
                    "Git-based Deployments"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-lg font-medium">
                      <Check className="w-6 h-6 opacity-60" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col justify-end items-start md:items-end border-t md:border-t-0 md:border-l border-current pt-8 md:pt-0 md:pl-12">
                 <div className="mb-8 text-left md:text-right">
                    <h4 className="text-xl font-bold uppercase tracking-widest mb-2">Object Storage</h4>
                    <p className="opacity-80">S3-compatible NVMe storage</p>
                    <p className="text-2xl font-bold mt-2">$0.015 / GB</p>
                 </div>
                 <Link 
                  href="/company/contact"
                  className="inline-flex items-center gap-4 text-2xl font-bold uppercase tracking-tight border-b-2 border-current hover:gap-6 transition-all"
                >
                  Contact Sales <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: CTA */}
       <section className="min-h-[50vh] flex flex-col justify-center px-6 py-24 relative z-10">
        <div className="max-w-7xl mx-auto w-full text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-12 text-brand-bone"
          >
            Start<br />Building.
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              href="/dashboard/space"
              className="inline-flex items-center gap-6 text-3xl md:text-5xl font-bold uppercase tracking-tighter border-b-4 border-brand-bone pb-2 hover:gap-8 transition-all text-brand-bone"
            >
              Launch Console <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
