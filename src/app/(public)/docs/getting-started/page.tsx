"use client";

import { Terminal, Cpu, Cloud, Brain, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function GettingStartedPage() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-brand-bone/80 prose-headings:text-brand-bone prose-strong:text-brand-bone prose-a:text-brand-bone prose-code:text-brand-bone">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-6 uppercase tracking-tighter">Introduction to Nodebase</h1>
        <p className="lead text-xl text-brand-bone/70 mb-8 font-light">
          Nodebase is India's first sovereign cloud and AI infrastructure platform, designed to empower the next generation of digital businesses. We provide the physical compute, scalable hosting, and intelligent agents needed to build world-class applications.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
          <div className="p-6 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-brand-bone/10 text-brand-bone">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-bone uppercase tracking-tight">kaisa AI</h3>
            </div>
            <p className="text-sm text-brand-bone/60">
              Intelligent agentic managers for Indian businesses. Hire digital employees for tasks like reception, appointment booking, and retail management.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-brand-bone/10 text-brand-bone">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-bone uppercase tracking-tight">Nodebase Space</h3>
            </div>
            <p className="text-sm text-brand-bone/60">
              Sovereign cloud hosting for developers. Deploy static sites, serverless functions, and containers with zero configuration.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-brand-bone/10 text-brand-bone">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-bone uppercase tracking-tight">Infrastructure</h3>
            </div>
            <p className="text-sm text-brand-bone/60">
              Physical compute nodes and H100 clusters located in our Tier-4 Data Center in Okhla, Delhi. True data sovereignty.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-brand-bone/10 text-brand-bone">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-bone uppercase tracking-tight">Data Sovereignty</h3>
            </div>
            <p className="text-sm text-brand-bone/60">
              All data resides within Indian borders. Compliant with DPDP Act 2023. No foreign data transfers.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-12 mb-6 uppercase tracking-tight">Why Nodebase?</h2>
        <ul className="space-y-4">
          <li>
            <strong>Local Infrastructure:</strong> Our primary data center is located in Okhla, New Delhi. This ensures low latency for Indian users and complete control over physical hardware.
          </li>
          <li>
            <strong>Simple Pricing:</strong> No hidden costs. Pay for what you use with clear, upfront pricing models.
          </li>
          <li>
            <strong>Developer First:</strong> Built by developers, for developers. Our CLI and API are designed to be intuitive and powerful.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-12 mb-6 uppercase tracking-tight">Getting Started</h2>
        <p>
          Ready to dive in? We recommend starting with our <Link href="/docs/getting-started/quickstart" className="text-brand-bone font-bold hover:underline decoration-brand-bone/30">Quickstart Guide</Link> to deploy your first application in minutes.
        </p>
      </motion.div>
    </div>
  );
}
