"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Server, ShieldCheck, Globe, Zap, Users, Lock } from "lucide-react";
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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10 bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-brand-saffron)_0%,_transparent_10%)] opacity-5"></div>
        </div>
        <NetworkBackground />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-medium mb-8">
              <Server className="w-4 h-4" />
              <span>Nodebase Infrastructure</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight"
            >
              The Foundation of <br />
              <span className="text-brand-saffron">India's Digital Future</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Nodebase owns and operates the physical infrastructure that powers kaisa AI and Nodebase Space. 
              A long-term, asset-backed network designed for sovereignty and scale.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/node/apply" className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all flex items-center gap-2">
                Apply to become a Node
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* A) What Nodebase Nodes Are */}
      <section className="py-24 bg-black relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">More than just software.</h2>
              <p className="text-lg text-white/70 leading-relaxed">
                A Node represents a standardized unit of participation in Nodebase's physical infrastructure network. 
                Unlike purely digital tokens or speculative assets, Nodes are tied to real-world compute, storage, and networking capacity.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "Asset-backed infrastructure participation",
                  "Directly supports kaisa AI & Nodebase Space",
                  "Designed for long-term stability",
                  "Non-speculative utility"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <div className="w-6 h-6 rounded-full bg-brand-saffron/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-brand-saffron"></div>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[400px] rounded-3xl overflow-hidden glass-card flex items-center justify-center">
               {/* Abstract visualization of a Node */}
               <div className="absolute inset-0 bg-gradient-to-br from-brand-saffron/5 to-transparent"></div>
               <div className="relative z-10 grid grid-cols-2 gap-4 p-8">
                  <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col items-center gap-3">
                     <Server className="w-8 h-8 text-brand-saffron" />
                     <span className="text-sm font-medium text-white/80">Compute</span>
                  </div>
                  <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col items-center gap-3">
                     <Globe className="w-8 h-8 text-brand-saffron" />
                     <span className="text-sm font-medium text-white/80">Network</span>
                  </div>
                  <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col items-center gap-3">
                     <Zap className="w-8 h-8 text-brand-saffron" />
                     <span className="text-sm font-medium text-white/80">Power</span>
                  </div>
                  <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col items-center gap-3">
                     <ShieldCheck className="w-8 h-8 text-brand-saffron" />
                     <span className="text-sm font-medium text-white/80">Security</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* B) Infrastructure Backbone */}
      <section className="py-24 bg-white/5 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-6">Built on Sovereign Infrastructure</h2>
            <p className="text-lg text-white/60">
              We don't just rent cloud servers. We build and manage the stack from the ground up to ensure data residency, performance, and cost-efficiency for Indian businesses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                icon: Server, 
                title: "Data Center", 
                desc: "Strategic partnership with a Tier-IV data center in Delhi NCR (Okhla) ensuring high availability." 
              },
              { 
                icon: Zap, 
                title: "High-Performance Compute", 
                desc: "H100 and A100 clusters dedicated to training and inference for kaisa AI models." 
              },
              { 
                icon: Globe, 
                title: "Resilient Network", 
                desc: "Carrier-neutral fiber connectivity with direct peering exchanges." 
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl glass-card hover:border-brand-saffron/30 hover:bg-white/10 transition-colors group">
                <feature.icon className="w-10 h-10 text-brand-saffron mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/node/infrastructure" className="text-brand-saffron hover:text-brand-saffron/80 font-medium inline-flex items-center gap-2">
              Explore our infrastructure
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* C) How Nodes Fit In */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-10 md:p-16 rounded-3xl bg-gradient-to-b from-white/5 to-black">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">The Role of Nodes</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-sm">1</span>
                    Scaling Capacity
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    Node capital is deployed directly into expanding physical infrastructure—purchasing servers, securing rack space, and increasing bandwidth.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm">2</span>
                    Generating Value
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    As kaisa AI and Nodebase Space acquire users, this infrastructure generates revenue. Nodes participate in this ecosystem growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D) Who This Is For */}
      <section className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-6">
           <div className="max-w-4xl mx-auto text-center">
             <h2 className="text-2xl font-bold text-white mb-12">Who is this for?</h2>
             <div className="grid md:grid-cols-2 gap-8 text-left">
               <div className="p-8 rounded-2xl glass-card hover:bg-white/10 transition-colors">
                 <div className="flex items-center gap-3 mb-4">
                   <Users className="w-6 h-6 text-brand-saffron" />
                   <h3 className="text-lg font-bold text-white">Long-term Partners</h3>
                 </div>
                 <p className="text-white/60">
                   Designed for individuals and institutions looking for stable, infrastructure-grade alignment with India's AI growth story over 3-5 years.
                 </p>
               </div>
               <div className="p-8 rounded-2xl glass-card">
                 <div className="flex items-center gap-3 mb-4">
                   <Lock className="w-6 h-6 text-brand-saffron" />
                   <h3 className="text-lg font-bold text-white">Serious Participants</h3>
                 </div>
                 <p className="text-white/60">
                   This is not a "get rich quick" scheme. It involves real hardware, depreciation, and operational cycles. Patience is required.
                 </p>
               </div>
             </div>
             
             <div className="mt-16">
               <Link href="/node/how-it-works" className="px-8 py-4 bg-brand-saffron text-black rounded-full font-bold hover:bg-brand-saffron/90 transition-all inline-flex items-center gap-2">
                 See how the model works
                 <ArrowRight className="w-4 h-4" />
               </Link>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
}
