"use client";

import { motion } from "framer-motion";
import { ArrowRight, Server, AppWindow, Banknote, Share2, ClipboardCheck, FileCheck, UserCheck, Key, PlayCircle, BarChart3, Mail, Info } from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Server,
      title: "1. Infrastructure Deployment",
      desc: "Nodebase acquires and deploys high-performance compute hardware (GPUs, Storage servers) at our Okhla, Delhi facility."
    },
    {
      icon: AppWindow,
      title: "2. Product Utilization",
      desc: "This infrastructure powers our core products: kaisa AI (for businesses) and Nodebase Space (cloud storage). Every chat and file upload uses this capacity."
    },
    {
      icon: Banknote,
      title: "3. Value Generation",
      desc: "Users pay for these services (SaaS subscriptions, API usage, Storage fees). This generates real-world revenue backed by utility."
    },
    {
      icon: Share2,
      title: "4. Node Participation",
      desc: "Node holders, who funded the Phase 1 infrastructure, participate in the ecosystem's growth through a structured rewards model."
    }
  ];

  const processSteps = [
    { icon: ClipboardCheck, title: "1. Expression of Interest", desc: "Submit an online form to express your intent to participate." },
    { icon: FileCheck, title: "2. Eligibility Screening", desc: "Initial review to ensure alignment with participation criteria." },
    { icon: UserCheck, title: "3. KYC / AML Verification", desc: "Identity and compliance checks for all participants." },
    { icon: Key, title: "4. MoU Execution", desc: "Sign a bilateral Memorandum of Understanding with Chishti Ventures Private Limited." },
    { icon: Banknote, title: "5. Capital Deployment", desc: "Transfer funds to a defined infrastructure pool for hardware procurement." },
    { icon: PlayCircle, title: "6. Deployment & Activation", desc: "Hardware is procured, installed, and activated (approx. 3 months)." },
    { icon: BarChart3, title: "7. Periodic Reporting", desc: "Receive updates on utilization and revenue generation." }
  ];

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">How the Model Works</h1>
          <p className="text-xl text-white/60 leading-relaxed">
            A closed-loop system where physical infrastructure drives digital value.
          </p>
        </div>

        {/* High Level Model */}
        <div className="relative border-l border-white/10 ml-6 md:ml-10 space-y-16 md:space-y-24 py-8 mb-32">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative pl-12 md:pl-16"
            >
              <div className="absolute -left-[25px] top-0 w-12 h-12 rounded-full bg-black border border-white/20 flex items-center justify-center z-10">
                <step.icon className="w-5 h-5 text-brand-saffron" />
              </div>
              
              <div className="glass-card p-8 rounded-2xl hover:bg-white/10 transition-colors">
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-white/60 text-lg leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Participation Process */}
        <div className="mb-32">
           <h2 className="text-3xl font-bold mb-12 text-center">Participation Process</h2>
           <div className="grid md:grid-cols-2 gap-4">
             {processSteps.map((step, i) => (
               <div key={i} className="flex gap-4 p-6 glass-card rounded-xl hover:bg-white/10 transition-colors">
                  <div className="mt-1 shrink-0">
                    <step.icon className="w-6 h-6 text-white/40" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1 text-sm">{step.title}</h3>
                    <p className="text-sm text-white/50">{step.desc}</p>
                  </div>
               </div>
             ))}
           </div>
           <div className="mt-8 text-center">
             <Link href="/company/contact" className="inline-flex items-center gap-2 text-brand-saffron hover:text-white transition-colors font-medium">
               Apply for Node Access <ArrowRight className="w-4 h-4" />
             </Link>
           </div>
        </div>

        {/* Reporting Section */}
        <div className="glass-card rounded-2xl p-8 md:p-12 text-center">
           <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
             <Mail className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-2xl font-bold mb-4">Reporting & Transparency</h2>
           <p className="text-white/60 max-w-2xl mx-auto mb-8 leading-relaxed">
             Until Phase 2 dashboards are launched, participants receive detailed periodic email reports covering 
             utilization summaries, revenue generated, operational costs deducted, and net distributable amounts.
           </p>
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-xs font-medium text-white/50">
             <Info className="w-3 h-3" />
             <span>Dashboards currently in development (Phase 2)</span>
           </div>
        </div>

        <div className="mt-20 flex justify-center">
          <Link href="/node/infrastructure" className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all flex items-center gap-2">
            Explore the Infrastructure
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
