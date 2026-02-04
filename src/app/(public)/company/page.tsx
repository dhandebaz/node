"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  Globe, 
  Flag, 
  Cpu, 
  Database, 
  Layers, 
  Zap, 
  CheckCircle2 
} from "lucide-react";
import Image from "next/image";

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
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-brand-saffron/30 font-sans">
      
      {/* 1. HERO: Why Nodebase Exists */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-blue)_0%,_transparent_15%)] opacity-20"></div>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-brand-saffron text-sm font-medium mb-8 border border-brand-saffron/20">
              <Flag className="w-4 h-4" />
              <span>Made in India. For India.</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight"
            >
              Why Nodebase Exists
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Running a business today shouldn’t feel like fighting your own tools. 
              Yet founders are stuck paying 20–30% commissions, juggling dashboards that don’t talk to each other, and dealing with cloud infrastructure that’s expensive, unpredictable, and built for engineers, not operators.
            </motion.p>

            <motion.div variants={fadeInUp} className="p-6 glass-card rounded-2xl border-l-4 border-brand-saffron text-left max-w-2xl mx-auto bg-white/5">
               <p className="text-lg text-white font-medium">
                 Nodebase exists to fix that. We’re building infrastructure that works quietly in the background so businesses can focus on growth, not glue work.
               </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. WHAT NODEBASE IS */}
      <section className="py-24 bg-black relative">
        <div className="container mx-auto px-6">
           <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">What Nodebase Is</h2>
                <p className="text-white/60 text-lg">AI-native infrastructure for the modern operator.</p>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                   { icon: Users, title: "AI Employees", desc: "Digital workers with clear roles, not chatbots." },
                   { icon: Zap, title: "Automated Hosting", desc: "Designed for hands-off operations." },
                   { icon: Shield, title: "Secure & Isolated", desc: "Environments that keep your data safe." },
                   { icon: Database, title: "Data Ownership", desc: "Predictable costs, full control." },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-8 rounded-2xl hover:bg-white/10 transition-colors"
                  >
                     <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-brand-saffron">
                        <item.icon className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                     <p className="text-white/60">{item.desc}</p>
                  </motion.div>
                ))}
             </div>

             <div className="mt-16 text-center max-w-3xl mx-auto">
                <p className="text-xl text-white/80 leading-relaxed">
                  Instead of stitching together tools, vendors, and people, Nodebase gives you one system where digital workers and infrastructure are already aligned. 
                  <span className="block mt-4 font-bold text-white text-2xl">AI here doesn’t behave like a chatbot. It behaves like staff.</span>
                </p>
             </div>
           </div>
        </div>
      </section>

      {/* 3. INFRASTRUCTURE DONE DIFFERENTLY */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-blue/5"></div>
        <div className="container mx-auto px-6 relative z-10">
           <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                 <h2 className="text-3xl md:text-5xl font-bold leading-tight">Infrastructure,<br/>Done Differently.</h2>
                 <p className="text-lg text-white/70">
                   Nodebase hosting is built from the ground up for automation-heavy businesses. Whether you’re running a website, internal dashboard, or AI workflows, the infrastructure stays stable, controlled, and boring in the best way possible.
                 </p>
                 
                 <div className="space-y-4">
                    {[
                      "Each business runs in an isolated environment",
                      "AI employees operate inside secure containers",
                      "Data is encrypted, exportable, and owned by you",
                      "No surprise bills, no usage traps, no lock-in"
                    ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                         <CheckCircle2 className="w-5 h-5 text-brand-green flex-shrink-0" />
                         <span className="text-white/90">{item}</span>
                      </motion.div>
                    ))}
                 </div>
              </div>
              <div className="flex-1">
                 <div className="relative aspect-square">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 to-brand-green/20 rounded-full blur-3xl"></div>
                    <div className="glass-dark rounded-2xl p-8 border border-white/10 relative z-10 h-full flex flex-col justify-center">
                       <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                             <Cpu className="w-5 h-5" />
                          </div>
                          <div>
                             <div className="text-sm font-bold">Container #8821</div>
                             <div className="text-xs text-white/50">Active • 99.9% Uptime</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                             <Layers className="w-5 h-5" />
                          </div>
                          <div>
                             <div className="text-sm font-bold">Encrypted Volume</div>
                             <div className="text-xs text-white/50">AES-256 • Sovereign</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="w-10 h-10 rounded-full bg-saffron-500/20 flex items-center justify-center text-brand-saffron">
                             <Shield className="w-5 h-5" />
                          </div>
                          <div>
                             <div className="text-sm font-bold">Access Control</div>
                             <div className="text-xs text-white/50">Role-based • Audited</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 4. PHILOSOPHY */}
      <section className="py-24 bg-black relative">
        <div className="container mx-auto px-6">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold mb-4">Our Philosophy</h2>
             <p className="text-white/60">Built on control, clarity, and long-term sustainability.</p>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { title: "Sovereignty", text: "Businesses should own their data." },
                { title: "Predictability", text: "Infrastructure should be predictable." },
                { title: "Simplicity", text: "Automation should reduce stress, not add complexity." },
                { title: "Dignity", text: "AI should replace repetitive labor, not human dignity." },
                { title: "Independence", text: "Growth should not depend on platforms that tax you forever." },
                { title: "Sustainability", text: "Long-term value over short-term hype." }
              ].map((card, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 rounded-2xl hover:border-brand-saffron/30 transition-colors"
                >
                   <h3 className="text-xl font-bold mb-3 text-white">{card.title}</h3>
                   <p className="text-white/70">{card.text}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 5. TEAM & WHO IT IS FOR */}
      <section className="py-24 relative">
         <div className="absolute inset-0 bg-white/5"></div>
         <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
               <div className="flex flex-col lg:flex-row items-center gap-16">
                  
                  {/* Who Nodebase Is For */}
                  <div className="flex-1 space-y-8 order-2 lg:order-1">
                     <h2 className="text-3xl font-bold">Who Nodebase Is For</h2>
                     <ul className="space-y-4">
                        {[
                          "Solo founders and small teams",
                          "Property owners and hosts",
                          "Agencies and service businesses",
                          "Independent organizations and institutions",
                          "Anyone tired of platform dependency"
                        ].map((item, i) => (
                           <li key={i} className="flex items-center gap-3 text-lg text-white/80">
                              <div className="w-2 h-2 bg-brand-saffron rounded-full"></div>
                              {item}
                           </li>
                        ))}
                     </ul>
                     <p className="text-white/60 italic border-l-2 border-white/20 pl-4 py-2">
                        "If you want fewer middlemen and more control, Nodebase fits."
                     </p>
                  </div>

                  {/* Team Image */}
                  <div className="flex-1 order-1 lg:order-2">
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                     >
                        <Image 
                          src="/images/integrations/team.png" 
                          alt="The Nodebase Team - Building India's Sovereign Cloud" 
                          width={1200} 
                          height={800}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          quality={90}
                          className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                           <div className="absolute bottom-6 left-6">
                              <p className="text-white font-bold text-lg">The Nodebase Team</p>
                              <p className="text-white/60 text-sm">Building India-first infrastructure.</p>
                           </div>
                        </div>
                     </motion.div>
                  </div>
               </div>

               {/* Closing Narrative */}
               <div className="mt-24 text-center max-w-4xl mx-auto">
                  <h3 className="text-2xl font-bold mb-6">Calm systems. Strong foundations. Real ownership.</h3>
                  <p className="text-xl text-white/70 leading-relaxed mb-8">
                     We see AI as digital labor and infrastructure as shared rails. 
                     The future isn’t thousands of fragile SaaS tools. It’s fewer systems that actually work together.
                     Nodebase is building India-first infrastructure that can scale globally, without copying the mistakes of bloated cloud monopolies.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 bg-black text-center">
         <div className="container mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto glass-dark p-12 rounded-3xl border border-white/10 relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-saffron via-white to-brand-green"></div>
               <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">Nodebase is not a platform you rent.</h2>
               <p className="text-2xl text-brand-saffron font-medium mb-10">It’s infrastructure you build on.</p>
               
               <button className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Start Building Today
               </button>
            </motion.div>
         </div>
      </section>

    </div>
  );
}
