"use client";

import { motion } from "framer-motion";
import { Plug, ArrowRight, Database, LayoutGrid, Code2 } from "lucide-react";
import Link from "next/link";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function TechnologyPartnersPage() {
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
              Technology<br/>Partners
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-brand-bone/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Integrate your software with Nodebase and reach thousands of Indian businesses.
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
            className="max-w-4xl mx-auto mb-20 text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-6 uppercase tracking-tight text-brand-bone">Build for the Sovereign Cloud</motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-brand-bone/70 leading-relaxed font-light">
              Join our ecosystem of ISVs, SaaS providers, and developer tools. 
              Nodebase provides the APIs and marketplace distribution you need to grow in the Indian market.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8 mb-24 max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors group">
              <div className="w-14 h-14 bg-brand-bone/10 rounded-xl flex items-center justify-center mb-6 text-brand-bone group-hover:scale-110 transition-transform">
                <Plug className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase tracking-tight text-brand-bone">API Integrations</h3>
              <p className="text-brand-bone/60 leading-relaxed">
                Connect your platform with kaisa AI agents and Space infrastructure. 
                Enable seamless workflows for mutual customers.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors group">
              <div className="w-14 h-14 bg-brand-bone/10 rounded-xl flex items-center justify-center mb-6 text-brand-bone group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase tracking-tight text-brand-bone">Marketplace Listing</h3>
              <p className="text-brand-bone/60 leading-relaxed">
                Publish your application to the Nodebase Marketplace. 
                Get discovered by enterprises looking for sovereign-compliant tools.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors group">
              <div className="w-14 h-14 bg-brand-bone/10 rounded-xl flex items-center justify-center mb-6 text-brand-bone group-hover:scale-110 transition-transform">
                <Database className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase tracking-tight text-brand-bone">Data Solutions</h3>
              <p className="text-brand-bone/60 leading-relaxed">
                Offer specialized databases, analytics, or storage solutions 
                optimized for our NVMe-native infrastructure.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="p-12 rounded-3xl border border-brand-bone/10 bg-brand-bone/5 text-center max-w-4xl mx-auto"
          >
            <div className="flex flex-col items-center">
              <Code2 className="w-12 h-12 text-brand-bone/40 mb-6" />
              <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight text-brand-bone">Developer First</h2>
              <p className="text-xl text-brand-bone/60 mb-8 max-w-2xl">
                We provide comprehensive SDKs, webhooks, and sandbox environments 
                to make integration a breeze.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="mailto:partners@nodebase.in?subject=Technology%20Partnership" 
                  className="px-8 py-4 bg-brand-bone text-brand-deep-red font-bold rounded-full hover:bg-white transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm">
                  Build Integration <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/docs/kaisa/integrations" 
                  className="px-8 py-4 bg-transparent border border-brand-bone/20 text-brand-bone font-bold rounded-full hover:bg-brand-bone/10 transition-colors uppercase tracking-wider text-sm">
                  View API Docs
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
