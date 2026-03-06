"use client";

import { motion } from "framer-motion";
import { Shield, Users, Flag, Database, Layers, Zap, CheckCircle2, Cpu, ArrowRight, Target, Heart, Globe } from "lucide-react";
import Link from "next/link";

export default function CompanyPage() {
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
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone relative overflow-hidden font-sans selection:bg-brand-bone/20 bg-grid-pattern">
      
      {/* 1. HERO: Mission Statement */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative z-10 border-b border-brand-bone/10">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-5xl"
          >
            <motion.div variants={fadeInUp} className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-8 text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60">
              About Nodebase
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-display-large uppercase tracking-tighter mb-8 text-brand-bone leading-[0.9]"
            >
              We are building the<br/>intelligent workforce<br/>for Indian businesses.
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-brand-bone/70 font-light max-w-3xl leading-relaxed"
            >
              Nodebase provides the AI infrastructure that empowers millions of solo entrepreneurs, doctors, and shop owners to operate at the scale of large corporations.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 2. VALUES */}
      <section className="py-24 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 flex items-center gap-3">
                <Target className="w-6 h-6 text-brand-bone" />
                Sovereignty
              </h3>
              <p className="text-brand-bone/70 leading-relaxed">
                We believe Indian businesses should own their data and intelligence. Our infrastructure is built for privacy and local compliance from day one.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 flex items-center gap-3">
                <Zap className="w-6 h-6 text-brand-bone" />
                Simplicity
              </h3>
              <p className="text-brand-bone/70 leading-relaxed">
                Technology should be invisible. We build complex AI systems so you can use them as easily as sending a WhatsApp message.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 flex items-center gap-3">
                <Heart className="w-6 h-6 text-brand-bone" />
                Empowerment
              </h3>
              <p className="text-brand-bone/70 leading-relaxed">
                We don't replace humans; we remove the drudgery. Our goal is to free you to focus on what makes your business unique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TEAM / CULTURE */}
      <section className="py-24 px-6 border-t border-brand-bone/10 bg-brand-deep-red/50">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-12">Join the Mission</h2>
          <p className="text-xl text-brand-bone/70 max-w-2xl mx-auto mb-12">
            We are a small, high-performance team based in Bangalore. We value shipping speed, deep technical craft, and customer obsession.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/company/careers" className="px-8 py-4 bg-brand-bone text-brand-deep-red font-bold uppercase tracking-wide rounded-full hover:bg-white transition-colors">
              View Careers
            </Link>
            <Link href="/company/contact" className="px-8 py-4 border border-brand-bone text-brand-bone font-bold uppercase tracking-wide rounded-full hover:bg-brand-bone/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
