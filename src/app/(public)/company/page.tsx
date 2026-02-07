"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Shield, 
  Users, 
  Flag, 
  Database, 
  Layers, 
  Zap, 
  CheckCircle2,
  Cpu,
  ArrowRight,
  Target,
  Heart,
  Globe
} from "lucide-react";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

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
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone selection:bg-brand-bone/20 font-sans">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <NetworkBackground />
      </div>
      
      {/* 1. HERO: Mission Statement */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden z-10">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-bone/10 text-brand-bone text-sm font-bold uppercase tracking-wider mb-8 border border-brand-bone/20">
              <Flag className="w-4 h-4" />
              <span>Made in India. For the World.</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-8xl font-bold uppercase tracking-tighter text-brand-bone mb-8 leading-[0.85]"
            >
              The Operating<br/>System for<br/>Business.
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-brand-bone/80 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            >
              We are building the infrastructure that allows businesses to run themselves. 
              From physical nodes in Delhi to AI agents in the cloud, Nodebase is the bridge between raw compute and real-world results.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 2. THE STORY / CONTEXT */}
      <section className="py-24 relative z-10 border-t border-brand-bone/10">
        <div className="container mx-auto px-6">
           <div className="max-w-4xl mx-auto">
             <div className="grid md:grid-cols-[1fr_2fr] gap-12 items-start">
                <div>
                   <h2 className="text-3xl font-bold uppercase tracking-tight text-brand-bone sticky top-32">The Problem</h2>
                </div>
                <div className="space-y-8 text-lg text-brand-bone/80 leading-relaxed">
                   <p>
                     <strong>The cloud is broken for operators.</strong> Today's infrastructure was built for engineers who love tinkering with configurations, not for business owners who just want results.
                   </p>
                   <p>
                     Founders are stuck paying 20–30% platform commissions, hiring expensive DevOps teams, and stitching together dozens of SaaS tools just to get basic operations running. The complexity is suffocating.
                   </p>
                   <p>
                     We believe the future of business isn't about managing more software—it's about managing outcomes. That requires a new kind of stack: one that combines sovereign hardware with autonomous AI agents.
                   </p>
                </div>
             </div>

             <div className="h-px bg-brand-bone/10 my-16"></div>

             <div className="grid md:grid-cols-[1fr_2fr] gap-12 items-start">
                <div>
                   <h2 className="text-3xl font-bold uppercase tracking-tight text-brand-bone sticky top-32">Our Solution</h2>
                </div>
                <div className="space-y-8 text-lg text-brand-bone/80 leading-relaxed">
                   <p>
                     <strong>Nodebase is vertically integrated.</strong> We don't just resell AWS. We own the hardware (Nodes), we build the virtualization layer (Space), and we deploy the workforce (kaisa AI).
                   </p>
                   <ul className="space-y-6 mt-8">
                      <li className="flex items-start gap-4">
                        <div className="p-2 bg-brand-bone/10 rounded-lg shrink-0">
                           <Cpu className="w-5 h-5 text-brand-bone" />
                        </div>
                        <div>
                           <h4 className="text-xl font-bold text-brand-bone mb-1">Physical Sovereignty</h4>
                           <p className="text-sm">Real hardware assets in secure Indian datacenters. No black-box cloud magic.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="p-2 bg-brand-bone/10 rounded-lg shrink-0">
                           <Users className="w-5 h-5 text-brand-bone" />
                        </div>
                        <div>
                           <h4 className="text-xl font-bold text-brand-bone mb-1">Digital Workforce</h4>
                           <p className="text-sm">AI employees that live on the infrastructure, ready to work from Day 1.</p>
                        </div>
                      </li>
                   </ul>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* 3. CORE VALUES */}
      <section className="py-24 relative z-10 bg-brand-bone/5 border-y border-brand-bone/10">
        <div className="container mx-auto px-6">
           <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4 text-brand-bone">Our Principles</h2>
             <p className="text-brand-bone/60 text-lg max-w-2xl mx-auto">The code we live by.</p>
           </div>

           <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                { 
                  icon: Target, 
                  title: "Outcome Over Output", 
                  text: "We don't care about lines of code or hours worked. We care about solved problems and shipped value." 
                },
                { 
                  icon: Shield, 
                  title: "Radical Ownership", 
                  text: "We own our stack, our mistakes, and our future. No passing the buck. If it breaks, we fix it." 
                },
                { 
                  icon: Heart, 
                  title: "Human First", 
                  text: "Technology exists to serve humans, not replace them. We automate drudgery so people can do creative work." 
                },
                { 
                  icon: Globe, 
                  title: "Sovereign by Design", 
                  text: "Data should stay where it belongs. We build for local compliance, local speed, and local control." 
                },
                { 
                  icon: Zap, 
                  title: "Speed is a Feature", 
                  text: "Slow software kills momentum. We optimize for milliseconds in our code and minutes in our decisions." 
                },
                { 
                  icon: Layers, 
                  title: "Simplicity Wins", 
                  text: "Complexity is the enemy of scale. We fight to keep things simple, even when it's hard." 
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-deep-red hover:bg-brand-bone/5 transition-colors group"
                >
                  <item.icon className="w-10 h-10 text-brand-bone/50 mb-6 group-hover:text-brand-bone transition-colors" />
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-brand-bone">{item.title}</h3>
                  <p className="text-brand-bone/70 leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. JOIN US / CTA */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6">
           <div className="max-w-5xl mx-auto bg-black/20 backdrop-blur-md rounded-3xl p-12 md:p-20 border border-brand-bone/10 text-center relative overflow-hidden">
             {/* Decorative background elements */}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-bone/5 to-transparent pointer-events-none"></div>
             
             <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8 text-brand-bone relative z-10">
               Build the Future<br/>With Us.
             </h2>
             <p className="text-xl text-brand-bone/70 mb-12 max-w-2xl mx-auto relative z-10">
               We're a small, high-impact team based in India, taking on the global giants. 
               If you love hard engineering problems and beautiful design, we want you.
             </p>
             
             <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
                <Link 
                  href="/company/careers"
                  className="group flex items-center gap-3 px-8 py-4 bg-brand-bone text-brand-deep-red rounded-full font-bold text-lg uppercase tracking-wider hover:bg-white transition-all hover:scale-105"
                >
                  View Open Roles
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/company/contact"
                  className="group flex items-center gap-3 px-8 py-4 border border-brand-bone/30 text-brand-bone rounded-full font-bold text-lg uppercase tracking-wider hover:bg-brand-bone/10 transition-all"
                >
                  Contact Us
                </Link>
             </div>
           </div>
        </div>
      </section>
      
      {/* 5. PARTNERS STRIP */}
      <section className="py-16 border-t border-brand-bone/10 relative z-10 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        <div className="container mx-auto px-6 text-center">
           <p className="text-sm font-bold uppercase tracking-widest text-brand-bone/40 mb-8">Trusted by Industry Leaders</p>
           <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center">
              {/* Placeholders for partner logos - using text for now */}
              {['Dell Technologies', 'NVIDIA Inception', 'Equinix', 'Supabase'].map((partner) => (
                <span key={partner} className="text-2xl font-bold text-brand-bone/60">{partner}</span>
              ))}
           </div>
        </div>
      </section>

    </div>
  );
}