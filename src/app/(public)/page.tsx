"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-brand-deep-red text-brand-bone selection:bg-brand-bone selection:text-brand-deep-red relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <NetworkBackground />
      </div>

      {/* SECTION 1: HERO */}
      <section className="min-h-[90vh] flex flex-col justify-center px-6 pt-32 pb-16 relative border-b border-brand-bone/20 z-10">
        <motion.div 
          initial="initial"
          animate="animate"
          variants={stagger}
          className="max-w-7xl mx-auto w-full"
        >
          <motion.h1 
            variants={fadeInUp}
            className="text-display-huge uppercase leading-[0.85] tracking-tighter mb-6 md:mb-8"
          >
            Hire AI<br />
            Employees.
          </motion.h1>
          
          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-8 md:mt-12 border-t border-brand-bone/20 pt-6 md:pt-8"
          >
            <div>
              <p className="text-editorial-body max-w-md text-white">
                Sales, support, operations, and finance managed by AI leadership.
                Not tools. Not copilots. Real autonomous workers.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start justify-end">
              <Link 
                href="/login"
                className="group flex items-center gap-4 text-2xl font-semibold uppercase tracking-tight hover:gap-6 transition-all"
              >
                Start Hiring <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2: PHILOSOPHY */}
      <section className="min-h-auto md:min-h-screen flex flex-col justify-center px-6 py-16 md:py-24 border-b border-brand-bone/20 z-10 relative bg-brand-deep-red/90 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto w-full"
        >
          <h2 className="text-display-huge uppercase leading-[0.85] tracking-tighter mb-8 md:mb-12">
            The End of<br />Drudgery.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div className="border-t border-brand-bone/20 pt-6">
               <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Autonomous</h3>
               <p className="text-2xl leading-tight opacity-90">
                 Systems that work while you sleep. No sick days. No training gaps. Pure execution.
               </p>
            </div>
            <div className="border-t border-brand-bone/20 pt-6">
               <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Scalable</h3>
               <p className="text-2xl leading-tight opacity-90">
                 Spin up a sales team of 50 agents in minutes. Scale down instantly. Infinite elasticity.
               </p>
            </div>
            <div className="border-t border-brand-bone/20 pt-6">
               <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Intelligent</h3>
               <p className="text-2xl leading-tight opacity-90">
                 Powered by Nodebase Core. Context-aware, memory-persistent, and goal-oriented.
               </p>
            </div>
             <div className="border-t border-brand-bone/20 pt-6">
               <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Secure</h3>
               <p className="text-2xl leading-tight opacity-90">
                 Enterprise-grade encryption. Isolated environments. Your data never leaves your control.
               </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3: MANAGER */}
      <section className="min-h-auto md:min-h-screen flex flex-col justify-center px-6 py-16 md:py-24 border-b border-brand-bone/20 z-10 relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 border-b border-brand-bone/20 pb-4">
            <span className="text-sm font-bold uppercase tracking-widest">Product 01</span>
            <span className="text-sm font-bold uppercase tracking-widest">Operations & Sales</span>
          </div>
          
          <h2 className="text-display-huge uppercase leading-[0.85] tracking-tighter mb-6 md:mb-8">
            Manager
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-8">
            <div>
              <p className="text-display-large font-normal opacity-90 mb-8 md:mb-12">
                Your autonomous<br />operations leader.
              </p>
               <ul className="space-y-6">
                  {[
                    "Sales Pipeline Management",
                    "Customer Support Dispatch",
                    "Inventory & Operations",
                    "Team Scheduling",
                    "Performance Analytics"
                  ].map((item, i) => (
                    <li key={i} className="text-2xl font-medium border-b border-brand-bone/20 pb-2 flex items-center gap-4">
                      <span className="text-sm font-bold opacity-50">0{i+1}</span>
                      {item}
                    </li>
                  ))}
               </ul>
            </div>
            
            <div className="flex flex-col justify-between h-full">
              <p className="text-editorial-body max-w-md mb-8 text-brand-bone/90">
                The Manager handles day-to-day business logic, coordinates support tickets, manages sales pipelines, and ensures operational efficiency without human oversight.
              </p>
              <div className="mt-auto">
                 <Link 
                  href="/login?plan=manager"
                  className="inline-block border border-brand-bone px-8 py-4 text-lg font-bold uppercase tracking-wider hover:bg-brand-bone hover:text-brand-deep-red transition-colors w-fit"
                >
                  Hire Manager
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CO-FOUNDER */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-16 md:py-24 border-b border-brand-bone/20 z-10 relative bg-brand-deep-red/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 border-b border-brand-bone/20 pb-4">
            <span className="text-sm font-bold uppercase tracking-widest">Product 02</span>
            <span className="text-sm font-bold uppercase tracking-widest">Strategy & Scale</span>
          </div>
          
          <h2 className="text-display-huge uppercase leading-[0.85] tracking-tighter mb-6 md:mb-8">
            Co-Founder
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-8">
             <div>
              <p className="text-display-large font-normal opacity-90 mb-8 md:mb-12">
                Strategic vision<br />and execution.
              </p>
               <ul className="space-y-6">
                  {[
                    "Financial Modeling",
                    "Growth Strategy",
                    "Market Analysis",
                    "Investor Reporting",
                    "Risk Assessment"
                  ].map((item, i) => (
                    <li key={i} className="text-2xl font-medium border-b border-brand-bone/20 pb-2 flex items-center gap-4">
                      <span className="text-sm font-bold opacity-50">0{i+1}</span>
                      {item}
                    </li>
                  ))}
               </ul>
            </div>

            <div className="flex flex-col justify-between h-full">
              <p className="text-editorial-body max-w-md mb-8 text-brand-bone/90">
                The Co-Founder analyzes market trends, plans growth strategies, manages financial modeling, and drives the long-term vision of your digital enterprise.
              </p>
               <div className="mt-auto">
                 <Link 
                  href="/login?plan=cofounder"
                  className="inline-block border border-brand-bone px-8 py-4 text-lg font-bold uppercase tracking-wider hover:bg-brand-bone hover:text-brand-deep-red transition-colors w-fit"
                >
                  Hire Co-Founder
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: INFRASTRUCTURE / ARCHITECTURE */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-16 md:py-24 border-b border-brand-bone/20 z-10 relative">
        <div className="max-w-7xl mx-auto w-full">
           <h2 className="text-display-huge uppercase leading-[0.85] tracking-tighter mb-12 md:mb-16">
            Nodebase<br />Core System.
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
             <div className="border-l border-brand-bone/20 pl-6 flex flex-col justify-between h-full min-h-[300px]">
               <div>
                  <h3 className="text-4xl font-bold uppercase mb-4 tracking-tighter">Compute</h3>
                  <p className="text-lg opacity-80 leading-relaxed">
                    H100 Clusters available for high-load agentic workflows. Optimized for LLM inference and real-time decision making.
                  </p>
               </div>
               <div className="font-mono text-sm mt-8 opacity-50">
                 STATUS: ONLINE
               </div>
             </div>
             
             <div className="border-l border-brand-bone/20 pl-6 flex flex-col justify-between h-full min-h-[300px]">
               <div>
                  <h3 className="text-4xl font-bold uppercase mb-4 tracking-tighter">Storage</h3>
                  <p className="text-lg opacity-80 leading-relaxed">
                    Enterprise-grade encrypted storage. Vector databases for long-term memory and context retention across sessions.
                  </p>
               </div>
               <div className="font-mono text-sm mt-8 opacity-50">
                 STATUS: ONLINE
               </div>
             </div>
             
             <div className="border-l border-brand-bone/20 pl-6 flex flex-col justify-between h-full min-h-[300px]">
               <div>
                  <h3 className="text-4xl font-bold uppercase mb-4 tracking-tighter">Network</h3>
                  <p className="text-lg opacity-80 leading-relaxed">
                    Global edge network ensuring low-latency interactions. Distributed nodes for maximum redundancy and uptime.
                  </p>
               </div>
               <div className="font-mono text-sm mt-8 opacity-50">
                 LATENCY: &lt;50ms
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA */}
       <section className="min-h-[60vh] flex flex-col justify-center px-6 py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto w-full text-center">
          <h2 className="text-display-huge uppercase leading-[0.85] tracking-tighter mb-8 md:mb-12">
            Ready to<br />Deploy?
          </h2>
          
          <Link 
            href="/login"
            className="inline-flex items-center gap-6 text-3xl md:text-5xl font-bold uppercase tracking-tighter border-b-4 border-brand-bone pb-2 hover:gap-8 transition-all hover:text-brand-bone/80 hover:border-brand-bone/80"
          >
            Initialize System <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
          </Link>
        </div>
      </section>

    </div>
  );
}
