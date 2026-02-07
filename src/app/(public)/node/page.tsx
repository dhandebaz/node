"use client";

import Link from "next/link";
import { ArrowRight, Shield, Activity, HelpCircle, FileText } from "lucide-react";
import { RoiCalculator } from "@/components/node/RoiCalculator";
import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function NodeOverviewPage() {
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
      <section className="min-h-auto md:min-h-screen flex flex-col justify-center px-6 pt-32 md:pt-24 pb-16 md:pb-12 relative z-10 border-b border-brand-bone/10">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-12 text-sm font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60">
              Network Status: Active
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-12 text-brand-bone">
              India's<br />
              Digital<br />
              Foundation.
            </motion.h1>
            
            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-brand-bone/20 pt-8">
              <p className="text-xl md:text-2xl text-brand-bone/80 font-light leading-relaxed max-w-md">
                Nodebase owns and operates the physical infrastructure that powers kaisa AI and Nodebase Space.
                A long-term, asset-backed network designed for sovereignty and scale.
              </p>
              <div className="flex flex-col items-start justify-end">
                <Link 
                  href="/node/apply"
                  className="group flex items-center gap-4 text-2xl font-bold uppercase tracking-tight text-brand-bone hover:gap-6 transition-all"
                >
                  Become a Node <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: THE ASSET */}
      <section className="min-h-auto md:min-h-screen flex flex-col justify-center px-6 py-16 md:py-24 border-b border-brand-bone/10 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
           <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-16 text-brand-bone"
           >
            Real World<br />Assets.
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-4xl md:text-6xl font-normal opacity-90 mb-8 text-brand-bone/80">
                Not a token.<br />
                Not a coin.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col justify-between"
            >
               <p className="text-xl text-brand-bone/80 font-light leading-relaxed max-w-md mb-12">
                 A Node represents a standardized unit of participation in Nodebase's physical infrastructure network. 
                 Tied directly to real-world compute (H100/A100), storage (NVMe), and networking capacity.
               </p>
               
               <ul className="space-y-6">
                  {[
                    "Revenue Share from Compute",
                    "Asset-Backed Ownership",
                    "Governance Rights",
                    "Priority Access"
                  ].map((item, i) => (
                    <li key={i} className="text-xl font-medium border-b border-brand-bone/20 pb-2 flex items-center gap-4 text-brand-bone">
                      <span className="text-sm font-bold opacity-50">0{i+1}</span>
                      {item}
                    </li>
                  ))}
               </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ROI CALCULATOR */}
      <section className="min-h-auto md:min-h-[70vh] flex flex-col justify-center px-6 py-16 md:py-24 border-b border-brand-bone/10 bg-black/10 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-brand-bone/20 pb-4">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-bone/60">Financials</span>
            <span className="text-sm font-bold uppercase tracking-widest text-brand-bone/60">Projection</span>
          </div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-12 text-brand-bone"
          >
            Calculate<br />Returns.
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <RoiCalculator />
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: EXPLORE NETWORK */}
      <section className="min-h-auto md:min-h-[50vh] flex flex-col justify-center px-6 py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
           <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-4xl md:text-6xl font-bold uppercase leading-[0.85] tracking-tighter mb-16 text-brand-bone"
           >
            Explore The<br />Network.
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Live Nodes", href: "/node/nodes", icon: Activity },
              { title: "How It Works", href: "/node/how-it-works", icon: FileText },
              { title: "Risk Factors", href: "/node/risk", icon: Shield },
              { title: "FAQ", href: "/node/faq", icon: HelpCircle },
            ].map((item, i) => (
               <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
               >
                 <Link 
                  href={item.href}
                  className="group flex flex-col justify-between p-8 border border-brand-bone/20 hover:bg-brand-bone hover:text-brand-deep-red transition-all min-h-[200px] bg-brand-bone/5"
                >
                  <item.icon className="w-8 h-8 mb-8" />
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold uppercase">{item.title}</span>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
               </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: INFRASTRUCTURE LINK */}
      <section className="min-h-[70vh] flex flex-col justify-center px-6 py-24 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-brand-bone/20 pb-4">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-bone/60">The Hardware</span>
            <span className="text-sm font-bold uppercase tracking-widest text-brand-bone/60">Okhla, Delhi</span>
          </div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-12 text-brand-bone"
          >
            See The<br />Hardware.
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              href="/node/infrastructure"
              className="inline-flex items-center gap-6 text-3xl md:text-5xl font-bold uppercase tracking-tighter border-b-4 border-brand-bone pb-2 hover:gap-8 transition-all text-brand-bone"
            >
              View Specs <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
