"use client";

import { Terminal, Cpu, Cloud, Brain, Shield } from "lucide-react";
import Link from "next/link";

export default function GettingStartedPage() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
      <h1 className="text-4xl font-bold text-white mb-6">Introduction to Nodebase</h1>
      <p className="lead text-xl text-zinc-400 mb-8">
        Nodebase is India's first sovereign cloud and AI infrastructure platform, designed to empower the next generation of digital businesses. We provide the physical compute, scalable hosting, and intelligent agents needed to build world-class applications.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
        <div className="p-6 rounded-2xl glass-card border border-white/5 hover:border-brand-saffron/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-brand-saffron/20 text-brand-saffron">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">kaisa AI</h3>
          </div>
          <p className="text-sm text-zinc-400">
            Intelligent agentic managers for Indian businesses. Hire digital employees for tasks like reception, appointment booking, and retail management.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-white/5 hover:border-white/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-white/20 text-white">
              <Cloud className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Nodebase Space</h3>
          </div>
          <p className="text-sm text-zinc-400">
            Sovereign cloud hosting for developers. Deploy static sites, serverless functions, and containers with zero configuration.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-white/5 hover:border-green-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-500">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Infrastructure</h3>
          </div>
          <p className="text-sm text-zinc-400">
            Physical compute nodes and H100 clusters located in our Tier-4 Data Center in Okhla, Delhi. True data sovereignty.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-white/5 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-500">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Data Sovereignty</h3>
          </div>
          <p className="text-sm text-zinc-400">
            All data resides within Indian borders. Compliant with DPDP Act 2023. No foreign data transfers.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mt-12 mb-6">Why Nodebase?</h2>
      <ul className="space-y-4 text-zinc-300">
        <li>
          <strong className="text-white">Local Infrastructure:</strong> Our primary data center is located in Okhla, New Delhi. This ensures low latency for Indian users and complete control over physical hardware.
        </li>
        <li>
          <strong className="text-white">Simple Pricing:</strong> No hidden costs. Pay for what you use with clear, upfront pricing models.
        </li>
        <li>
          <strong className="text-white">Developer First:</strong> Built by developers, for developers. Our CLI and API are designed to be intuitive and powerful.
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-white mt-12 mb-6">Getting Started</h2>
      <p>
        Ready to dive in? We recommend starting with our <Link href="/docs/getting-started/quickstart" className="text-brand-saffron hover:underline">Quickstart Guide</Link> to deploy your first application in minutes.
      </p>
    </div>
  );
}
