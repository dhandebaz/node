"use client";

import { motion } from "framer-motion";
import { Handshake, Building2, Code2, Cpu, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function PartnersPage() {
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

  const partners = [
    {
      category: "Hardware & Infrastructure",
      description: "Certified hardware providers for the Nodebase physical network.",
      items: ["Dell Technologies", "NVIDIA", "Supermicro", "Equinix"]
    },
    {
      category: "Technology Alliances",
      description: "Software vendors integrated directly into the kaisa AI stack.",
      items: ["Supabase", "Vercel", "Stripe", "Twilio"]
    },
    {
      category: "System Integrators",
      description: "Consultancies authorized to deploy private Nodebase environments.",
      items: ["Infosys", "Wipro", "Tech Mahindra", "HCLTech"]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone relative overflow-hidden font-sans selection:bg-brand-bone/20">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <NetworkBackground />
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-8 text-xs font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60 rounded-full">
              Ecosystem
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8 text-brand-bone leading-[0.85]"
            >
              Partner<br/>Network
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-brand-bone/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              We are building India's sovereign AI cloud with the world's best technology companies.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Partner Lists */}
      <section className="py-12 relative z-10 border-t border-brand-bone/10">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 max-w-5xl mx-auto">
             {partners.map((section, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.1 }}
                 className="grid md:grid-cols-[1fr_2fr] gap-8 border-b border-brand-bone/10 pb-12 last:border-0"
               >
                 <div>
                   <h3 className="text-2xl font-bold uppercase tracking-tight text-brand-bone mb-2">{section.category}</h3>
                   <p className="text-brand-bone/60 text-sm leading-relaxed">{section.description}</p>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-brand-bone/5 rounded-xl border border-brand-bone/10">
                        <CheckCircle2 className="w-5 h-5 text-brand-bone/40" />
                        <span className="font-bold text-brand-bone">{item}</span>
                      </div>
                    ))}
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Partner Types CTA */}
      <section className="py-24 relative z-10 bg-black/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-4 text-brand-bone">Join the Ecosystem</h2>
            <p className="text-brand-bone/60">Select your partnership track.</p>
          </div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20"
          >
            <motion.div variants={fadeInUp} className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors text-center group">
              <div className="w-16 h-16 mx-auto bg-brand-bone/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-brand-bone" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-brand-bone">Consulting</h3>
              <p className="text-brand-bone/70 mb-6 leading-relaxed text-sm">
                For SIs and agencies deploying AI solutions for enterprise clients.
              </p>
              <Link href="/company/partners/system-integrators" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-bone/60 group-hover:text-brand-bone transition-colors">
                Apply as Partner <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors text-center group">
              <div className="w-16 h-16 mx-auto bg-brand-bone/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code2 className="w-8 h-8 text-brand-bone" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-brand-bone">Technology</h3>
              <p className="text-brand-bone/70 mb-6 leading-relaxed text-sm">
                For SaaS platforms wanting to integrate with Nodebase infrastructure.
              </p>
              <Link href="/company/partners/technology" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-bone/60 group-hover:text-brand-bone transition-colors">
                Build Integration <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors text-center group">
              <div className="w-16 h-16 mx-auto bg-brand-bone/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-8 h-8 text-brand-bone" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-brand-bone">Hardware</h3>
              <p className="text-brand-bone/70 mb-6 leading-relaxed text-sm">
                For data centers and hardware OEMs validating their equipment.
              </p>
              <Link href="/company/partners/hardware" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-bone/60 group-hover:text-brand-bone transition-colors">
                Certify Hardware <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto rounded-3xl p-12 text-center border border-brand-bone/10 bg-brand-bone/5 relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-bone/50 to-transparent"></div>
             <h2 className="text-3xl font-bold uppercase tracking-tight mb-6 text-brand-bone">Ready to partner?</h2>
             <p className="text-xl text-brand-bone/70 mb-8 font-light">
               Contact our partnerships team to explore collaboration opportunities.
             </p>
             <a href="mailto:partners@nodebase.in" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-bone text-brand-deep-red font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-colors">
               <Handshake className="w-5 h-5" />
               Contact Partnerships
             </a>
          </motion.div>

        </div>
      </section>
    </div>
  );
}