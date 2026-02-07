"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
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

export default function ApplyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone relative overflow-hidden font-sans selection:bg-brand-bone/20">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <NetworkBackground />
      </div>
      
      {/* Header Section */}
      <section className="min-h-[50vh] flex flex-col justify-end px-6 pt-32 pb-12 border-b border-brand-bone/10 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeInUp}>
              <Link 
                href="/node"
                className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-12 text-sm font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60 hover:bg-brand-bone/10 transition-colors"
              >
                ← Back to Node
              </Link>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="mb-8">
              <span className="text-sm font-bold uppercase tracking-widest opacity-60 text-brand-bone">
                Phase 2B
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-8 text-brand-bone">
              Apply for<br />
              Participation
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-brand-bone/80 font-light leading-relaxed max-w-2xl">
              Join the Nodebase infrastructure network. Secure physical data center assets and earn from infrastructure utilization.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Prerequisites Section */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-24 border-b border-brand-bone/10 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold uppercase tracking-tight leading-none mb-8 text-brand-bone">
                Prerequisites
              </h2>
              <p className="text-xl text-brand-bone/80 leading-relaxed font-light">
                Ensure you meet the following criteria before starting the formal application process.
              </p>
            </motion.div>
            
            <div className="space-y-8">
              {[
                "Minimum commitment of 1 Node Unit (₹10,00,000)",
                "Valid Indian KYC (PAN, Aadhar)",
                "Bank account in own name for payouts",
                "Agreement to 3-year infrastructure lock-in"
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col gap-2 border-b border-brand-bone/20 pb-8 last:border-0"
                >
                  <span className="text-sm font-bold opacity-50 text-brand-bone">0{i + 1}</span>
                  <span className="text-2xl font-bold leading-tight text-brand-bone">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Action Section */}
      <section className="min-h-[50vh] flex flex-col justify-center px-6 py-24 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-brand-bone/20 bg-brand-bone/5 p-8 md:p-12 mb-12"
          >
            <p className="text-lg font-bold uppercase tracking-tight mb-4 text-brand-bone">
              Important Notice
            </p>
            <p className="text-xl text-brand-bone/80 leading-relaxed font-light">
              This is a formal application process. Submission of interest does not guarantee allocation. 
              All applications are reviewed by the Nodebase admin team.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
          >
            <Link 
              href="/node/apply/details"
              className="group flex items-center gap-4 text-4xl md:text-6xl font-bold uppercase tracking-tighter hover:gap-8 transition-all text-brand-bone"
            >
              Start Application <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
            </Link>
            
            <div className="text-right">
              <div className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2 text-brand-bone">
                Already a participant?
              </div>
              <Link 
                href="/node/dashboard"
                className="text-xl font-bold border-b border-brand-bone/40 hover:border-brand-bone transition-colors text-brand-bone"
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
