"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Target, ShieldCheck, Zap, Briefcase, BarChart3, Megaphone, Code2, Coins, Plug, HelpCircle } from "lucide-react";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function EmployeesPage() {
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

  const integrations = [
    { name: "Google", src: "/images/integrations/google.png" },
    { name: "WhatsApp", src: "/images/integrations/whatsapp.png" },
    { name: "Stripe", src: "/images/integrations/stripe.png" },
    { name: "Zoho", src: "/images/integrations/zoho.png" },
    { name: "Tally", src: "/images/integrations/tally.png" },
    { name: "Instagram", src: "/images/integrations/instagram.png" },
    { name: "Razorpay", src: "/images/integrations/razorpay.png" },
    { name: "Khatabook", src: "/images/integrations/khatabook.png" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-deep-red text-brand-bone font-sans selection:bg-brand-bone/20">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center items-center pt-32 md:pt-24 pb-16 px-6 overflow-hidden border-b border-brand-bone/10">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <NetworkBackground />
        </div>
        
        <div className="container mx-auto relative z-10 max-w-6xl text-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="flex flex-col items-center"
          >
            <div className="inline-block border border-brand-bone/20 px-4 py-1.5 mb-8 text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60">
              The Future of Work
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-[0.85] tracking-tighter mb-8 text-brand-bone">
              Hire AI<br />Employees.
            </h1>
            
            <p className="text-xl md:text-2xl text-brand-silver mb-12 max-w-2xl font-light leading-relaxed">
              Not chat bots. Not tools. Real employees that run your operations, 
              manage finances, and execute strategy 24/7.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ROLES COMPARISON */}
      <section className="py-16 md:py-24 px-6 border-b border-brand-bone/10 bg-black/10">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          >
            
            {/* Manager */}
            <motion.div variants={fadeInUp} className="group relative p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors flex flex-col h-full">
              <div className="absolute top-8 right-8 text-brand-bone/20 group-hover:text-brand-bone/40 transition-colors">
                <Users className="w-12 h-12" />
              </div>
              
              <h2 className="text-3xl font-bold uppercase tracking-tight mb-4 text-brand-bone">Manager</h2>
              <p className="text-lg text-brand-bone/60 mb-8 min-h-[3rem]">
                The operational backbone. Handles support, bookkeeping, and team coordination.
              </p>
              
              <ul className="space-y-4 mb-12 flex-grow">
                {[
                  "Customer Support & CRM",
                  "Invoicing & Basic Finance",
                  "Scheduling & Task Follow-up"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-brand-bone/80">
                    <div className="mt-1.5 w-1.5 h-1.5 bg-brand-bone/60 rounded-full" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/products/manager" 
                className="w-full py-4 bg-brand-bone text-brand-deep-red rounded-lg font-bold uppercase tracking-wide hover:bg-white transition-all text-center flex items-center justify-center gap-2 group-hover:scale-[1.02]"
              >
                View Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Co-Founder */}
            <motion.div variants={fadeInUp} className="group relative p-8 md:p-12 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors flex flex-col h-full">
              <div className="absolute top-8 right-8 text-brand-bone/20 group-hover:text-brand-bone/40 transition-colors">
                <Target className="w-12 h-12" />
              </div>
              
              <h2 className="text-3xl font-bold uppercase tracking-tight mb-4 text-brand-bone">Co-Founder</h2>
              <p className="text-lg text-brand-bone/60 mb-8 min-h-[3rem]">
                The strategic leader. Makes decisions, manages budgets, and drives growth.
              </p>
              
              <ul className="space-y-4 mb-12 flex-grow">
                {[
                  "Strategic Decision Making",
                  "Resource & Budget Allocation",
                  "Cross-Department Leadership"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-brand-bone/80">
                    <div className="mt-1.5 w-1.5 h-1.5 bg-brand-bone/60 rounded-full" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/products/co-founder" 
                className="w-full py-4 border border-brand-bone/20 text-brand-bone rounded-lg font-bold uppercase tracking-wide hover:bg-brand-bone/10 transition-all text-center flex items-center justify-center gap-2 group-hover:scale-[1.02]"
              >
                View Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* WAGE MODEL */}
      <section className="py-24 px-6 border-b border-brand-bone/10 bg-brand-bone/5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <div className="inline-block p-3 rounded-xl bg-brand-bone/10 mb-6 text-brand-bone">
                <Coins className="w-8 h-8" />
              </div>
              <h2 className="text-4xl font-bold uppercase mb-6 text-brand-bone leading-none">
                Fair Wages.<br/>No Salaries.
              </h2>
              <p className="text-xl text-brand-bone/60 mb-8 leading-relaxed">
                Traditional employees cost you money even when they're idle. 
                AI Employees are paid a <span className="text-brand-bone font-bold">wage (credits)</span> only when they perform a task.
              </p>
              <ul className="space-y-4">
                {[
                  "Pay only for work done",
                  "No monthly salaries or benefits",
                  "Scale up or down instantly"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-brand-bone/80">
                    <div className="w-1.5 h-1.5 bg-brand-bone rounded-full" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative p-8 border border-brand-bone/10 rounded-2xl bg-brand-deep-red/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-brand-bone/10">
                  <span className="text-brand-bone/60 uppercase tracking-widest text-sm">Cost Comparison</span>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-brand-bone">Human Manager</span>
                      <span className="text-red-400">₹45,000/mo</span>
                    </div>
                    <div className="h-2 bg-brand-bone/10 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-red-400/80" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-brand-bone">AI Manager</span>
                      <span className="text-green-400">₹1,500/mo (avg)</span>
                    </div>
                    <div className="h-2 bg-brand-bone/10 rounded-full overflow-hidden">
                      <div className="h-full w-[5%] bg-green-400" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-center text-xs text-brand-bone/40 font-mono">
                  *Based on average Indian SMB workload
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="py-24 px-6 border-b border-brand-bone/10">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-block p-3 rounded-xl bg-brand-bone/10 mb-6 text-brand-bone">
            <Plug className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold uppercase mb-4 text-brand-bone">
            Plug & Play
          </h2>
          <p className="text-xl text-brand-bone/60 mb-12 max-w-2xl mx-auto">
            They log in to your existing tools. No new software to learn. 
            Connects in seconds.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {integrations.map((logo, i) => (
              <div key={i} className="relative w-16 h-16 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <Image 
                  src={logo.src} 
                  alt={logo.name} 
                  fill 
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMING SOON ROLES */}
      <section className="py-24 px-6 border-b border-brand-bone/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold uppercase leading-none text-brand-bone">
              Coming Soon
            </h2>
            <p className="text-brand-bone/40 font-mono text-sm uppercase tracking-widest hidden sm:block">
              Expanding the Workforce
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Accountant", icon: BarChart3, desc: "Tax preparation, audits, and financial forecasting." },
              { title: "Marketer", icon: Megaphone, desc: "Campaign management, ad spend optimization, and content." },
              { title: "Engineer", icon: Code2, desc: "Full-stack development, maintenance, and deployment." }
            ].map((role, i) => (
              <div key={i} className="p-6 border border-brand-bone/5 bg-brand-bone/5 rounded-xl opacity-60 hover:opacity-100 transition-opacity">
                <role.icon className="w-8 h-8 text-brand-bone/40 mb-4" />
                <h3 className="text-xl font-bold uppercase mb-2 text-brand-bone">{role.title}</h3>
                <p className="text-brand-bone/60 text-sm">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 border-b border-brand-bone/10 bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold uppercase leading-none mb-16 text-center text-brand-bone">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "1. Hire", desc: "Select your AI employee and define their role and permissions." },
              { title: "2. Onboard", desc: "Connect them to your email, Slack, and CRM in minutes." },
              { title: "3. Run", desc: "They start working immediately, 24/7, with zero downtime." }
            ].map((step, i) => (
              <div key={i} className="p-8 border border-brand-bone/10 bg-brand-bone/5 backdrop-blur-sm rounded-xl">
                <h3 className="text-2xl font-bold uppercase mb-4 text-brand-bone">{step.title}</h3>
                <p className="text-brand-bone/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-b border-brand-bone/10 bg-brand-bone/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-block p-3 rounded-xl bg-brand-bone/10 mb-6 text-brand-bone">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-bold uppercase mb-4 text-brand-bone">Common Questions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { q: "Can I fire an AI employee?", a: "Yes, instantly. There is no notice period, no severance pay, and no hard feelings. You can pause or terminate their contract at any time." },
              { q: "Do they work on weekends?", a: "Yes. Your AI employees work 24/7/365. They do not take holidays, sick leaves, or sleep. They are always active." },
              { q: "Is my business data secure?", a: "Absolutely. We use enterprise-grade encryption and strict isolation. Your data is never used to train public models or shared with other customers." },
              { q: "How does billing work?", a: "You purchase credits (wages) in your wallet. Credits are deducted only when the AI performs a task. No monthly fixed salaries." }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
                <h3 className="text-xl font-bold mb-4 text-brand-bone">{item.q}</h3>
                <p className="text-brand-bone/60 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-8 text-brand-bone/40" />
          <h2 className="text-3xl md:text-5xl font-bold uppercase mb-8 text-brand-bone">Enterprise Grade Security</h2>
          <p className="text-xl text-brand-bone/60 mb-12">
            Your data is isolated, encrypted, and never used to train public models. 
            We adhere to strict privacy standards to ensure your business intelligence remains yours.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-brand-bone/40 text-sm font-mono uppercase tracking-widest">
            <span>SOC2 Compliant</span>
            <span>•</span>
            <span>End-to-End Encryption</span>
            <span>•</span>
            <span>Private Instances</span>
          </div>
        </div>
      </section>

    </div>
  );
}
