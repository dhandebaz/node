"use client";

import { motion } from "framer-motion";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { Bot, Users, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function KaisaOverviewPage() {
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
              kaisa AI
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8 text-brand-bone leading-[0.85]"
            >
              The Operating System<br/>for AI Employees
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-brand-bone/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Hire autonomous agents that work 24/7. From managing your calendar to running your entire company.
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
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            <Link href="/products/manager" className="group">
              <motion.div variants={fadeInUp} className="h-full p-10 rounded-3xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Bot className="w-32 h-32 text-brand-bone" />
                </div>
                <div className="relative z-10">
                  <div className="inline-block px-3 py-1 mb-6 rounded-full bg-brand-bone/10 text-brand-bone text-xs font-bold uppercase tracking-widest">
                    Entry Level
                  </div>
                  <h3 className="text-4xl font-bold mb-4 uppercase tracking-tighter text-brand-bone">AI Manager</h3>
                  <p className="text-lg text-brand-bone/70 mb-8 leading-relaxed">
                    Perfect for specific roles. Handles guest communication, bookings, and payments.
                  </p>
                  <span className="inline-flex items-center gap-2 text-brand-bone font-bold uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                    View Role <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            </Link>

            <Link href="/products/co-founder" className="group">
              <motion.div variants={fadeInUp} className="h-full p-10 rounded-3xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Users className="w-32 h-32 text-brand-bone" />
                </div>
                <div className="relative z-10">
                   <div className="inline-block px-3 py-1 mb-6 rounded-full bg-brand-saffron/20 text-brand-saffron text-xs font-bold uppercase tracking-widest">
                    Executive
                  </div>
                  <h3 className="text-4xl font-bold mb-4 uppercase tracking-tighter text-brand-bone">Co-Founder</h3>
                  <p className="text-lg text-brand-bone/70 mb-8 leading-relaxed">
                    Strategic autonomy. Makes decisions, manages budgets, and leads operations.
                  </p>
                  <span className="inline-flex items-center gap-2 text-brand-bone font-bold uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                    View Role <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
